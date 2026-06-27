# convo/views/join_room_view.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.db import connection

from convo.utils.jwt_user import get_user_from_request
from convo.operations.room_pin_ops import room_pin_flow
from convo.operations.notification_ops import notification_flow
from convo.utils.notification_utils import send_real_time_notification


@csrf_exempt
def join_room_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]
    data = json.loads(request.body)

    pin = data.get("pin")
    if not pin:
        return JsonResponse({"error": "PIN required"}, status=400)

    result = room_pin_flow("verify", pin=pin)
    if not result or result["status"] != "verified":
        return JsonResponse({"error": "Invalid PIN"}, status=400)

    room_id = result["room_id"]
    admin_id = result["admin_id"]

    try:
        with connection.cursor() as cursor:
            # 1. Check if Quick Chat
            cursor.execute(
                "SELECT is_quick_chat FROM chat_rooms WHERE room_id = %s", [room_id])
            row = cursor.fetchone()
            is_quick_chat = row[0] if row else 0

            # 2. Check for existing membership
            cursor.execute("SELECT 1 FROM room_members WHERE room_id = %s AND user_id = %s", [
                           room_id, user_id])
            if cursor.fetchone():
                return JsonResponse({"status": "joined", "room_id": room_id})

            # 3. Handle Join Flow
            if is_quick_chat:
                # Direct Join: Just Approve (adds to room_members)
                cursor.callproc("sp_join_room", ["approve", room_id, user_id])

                # Notify Admin
                notification_flow(
                    action="create",
                    user_id=admin_id,
                    notif_type="join_approved",
                    room_id=room_id,
                    reference_id=user_id
                )
                return JsonResponse({"status": "joined", "room_id": room_id})

            else:
                # Standard Room: Create Request (Handle existing)
                cursor.execute("SELECT 1 FROM join_request WHERE room_id = %s AND user_id = %s AND status = 'pending'", [
                               room_id, user_id])
                if not cursor.fetchone():
                    cursor.callproc("sp_join_room", [
                                    "request", room_id, user_id])

                    # Notify Admin
                    notification_flow(
                        action="create",
                        user_id=admin_id,
                        notif_type="join_request",
                        room_id=room_id,
                        reference_id=user_id
                    )
                    # Fetch details for real-time notification
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT username FROM users WHERE user_id = %s", [user_id])
                        res_u = cursor.fetchone()
                        username = res_u[0] if res_u else "Someone"

                        cursor.execute(
                            "SELECT room_name FROM chat_rooms WHERE room_id = %s", [room_id])
                        res_r = cursor.fetchone()
                        room_name = res_r[0] if res_r else "a room"

                    send_real_time_notification(admin_id, {
                        "type": "join_request",
                        "room_id": room_id,
                        "room_name": room_name,
                        "reference_id": user_id,
                        "sender_name": username
                    })

                return JsonResponse({"status": "pending"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
