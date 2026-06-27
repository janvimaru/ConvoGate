from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from convo.utils.jwt_user import get_user_from_request
from convo.operations.expense_ops import create_expense, submit_payment, confirm_payment, reject_payment, get_expense_details
from convo.operations.room_ops import get_group_details


@csrf_exempt
def create_expense_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error
    user_id = payload["user_id"]

    try:
        data = json.loads(request.body)
        room_id = data.get("room_id")
        amount = data.get("amount")
        description = data.get("description")

        split_option = data.get("split_with", "ALL")
        split_members = []

        from django.db import connection
        with connection.cursor() as cursor:
            # 1. Get ALL Room Members (excluding creator)
            cursor.execute(
                "SELECT user_id FROM room_members WHERE room_id = %s", [room_id])
            rows = cursor.fetchall()
            all_room_members = [row[0] for row in rows if row[0] != user_id]

            # 2. Filter based on split_option
            if split_option == "ALL":
                split_members = all_room_members
            elif isinstance(split_option, list):
                # Verify these users are actually in the room
                split_members = [
                    uid for uid in split_option if uid in all_room_members]

        if not split_members:
            return JsonResponse({"success": False, "message": "No members selected to split with"})

        result = create_expense(room_id, user_id, amount,
                                description, split_members)

        if result.get("success"):
            # Create a message in the chat so it appears in the feed
            expense_id = result.get("expense_id")
            message_content = json.dumps(
                {"expense_id": expense_id, "description": description})

            # Use message_flow to create and broadcast
            try:
                from convo.operations.message_ops import message_flow
                message_flow(
                    action="send",
                    room_id=room_id,
                    sender_user_id=user_id,
                    message_type="expense",
                    content=message_content
                )
            except Exception as e:
                print(f"Failed to create expense message: {e}")

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def expense_action_view(request):
    """
    Handles pay, confirm, reject actions.
    action: 'pay', 'confirm', 'reject'
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error
    user_id = payload["user_id"]

    try:
        data = json.loads(request.body)
        action = data.get("action")
        payment_id = data.get("payment_id")

        result = {}
        if action == "pay":
            method = data.get("method", "CASH")
            result = submit_payment(payment_id, user_id, method)

            if result.get("success"):
                _broadcast_expense_update(result.get(
                    "expense_id"), "PAYMENT_SUBMITTED", payment_id)

        elif action == "confirm":
            result = confirm_payment(payment_id, user_id)
            if result.get("success"):
                _broadcast_expense_update(result.get(
                    "expense_id"), "PAYMENT_CONFIRMED", payment_id)

        elif action == "reject":
            result = reject_payment(payment_id, user_id)
            if result.get("success"):
                _broadcast_expense_update(result.get(
                    "expense_id"), "PAYMENT_REJECTED", payment_id)

        else:
            return JsonResponse({"success": False, "message": "Invalid action"}, status=400)

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


def _broadcast_expense_update(expense_id, event_type, payment_id):
    """
    Broadcasts update to the room so cards can refresh.
    We need room_id. Ideally we fetch it from expense_id.
    """
    # For now, let's assume the frontend will refresh or we send to all user channels involved?
    # Better: Send to the room channel.
    # But we need room_id. fetch it.
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT room_id FROM expenses WHERE expense_id = %s", [expense_id])
            row = cursor.fetchone()
            if row:
                room_id = row[0]
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"chat_{room_id}",
                    {
                        "type": "expense_update",
                        "expense_id": expense_id,
                        "event": event_type,
                        "payment_id": payment_id
                    }
                )
    except Exception as e:
        print(f"Broadcast Error: {e}")


@csrf_exempt
def get_expense_view(request, expense_id):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error
    user_id = payload["user_id"]

    result = get_expense_details(expense_id, user_id)
    return JsonResponse(result)
