from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

from convo.utils.jwt_user import get_user_from_request
from convo.operations.notification_ops import notification_flow
from convo.utils.notification_utils import send_real_time_notification


@csrf_exempt
def member_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    admin_id = payload["user_id"]

    try:
        data = json.loads(request.body)
        print("MEMBER_VIEW PAYLOAD:", data)

        action = data.get("action")
        room_id = data.get("room_id")
        target_user_id = data.get("user_id")

        if room_id is None or target_user_id is None:
            return JsonResponse({"error": f"Missing room_id or user_id in payload: {data}"}, status=400)

        room_id = int(room_id)
        target_user_id = int(target_user_id)

    except (ValueError, TypeError) as e:
        return JsonResponse({"error": f"Invalid ID format: {e}"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Payload error: {str(e)}"}, status=400)

    try:
        with connection.cursor() as cursor:

            if action == "approve_join":
                cursor.execute("""
                    INSERT INTO room_members (room_id, user_id)
                    VALUES (%s, %s)
                """, [room_id, target_user_id])

                cursor.execute("""
                    DELETE FROM join_request
                    WHERE room_id=%s AND user_id=%s
                """, [room_id, target_user_id])

                notif_type = "join_approved"

            elif action == "reject_join":
                cursor.execute("""
                    DELETE FROM join_request
                    WHERE room_id=%s AND user_id=%s
                """, [room_id, target_user_id])

                notif_type = "join_rejected"

            elif action == "remove_member":
                # 1. Check if admin_id is actually the admin of room_id
                cursor.execute("""
                    SELECT 1 FROM chat_rooms 
                    WHERE room_id = %s AND admin_user_id = %s
                """, [room_id, admin_id])

                if not cursor.fetchone():
                    return JsonResponse({"error": "Only admins can remove members"}, status=403)

                # 2. Prevent self-removal if needed, or just let it happen (usually Leave is separate)
                if admin_id == target_user_id:
                    return JsonResponse({"error": "Admin cannot remove themselves. Use Leave instead."}, status=400)

                # 3. Perform removal
                cursor.execute("""
                    DELETE FROM room_members 
                    WHERE room_id = %s AND user_id = %s
                """, [room_id, target_user_id])

                notif_type = "member_removed"

            else:
                return JsonResponse({"error": "Invalid action"}, status=400)

        # ✅ DB notification
        notification_flow(
            action="create",
            user_id=target_user_id,
            notif_type=notif_type,
            room_id=room_id,
            reference_id=admin_id
        )

        # ✅ WS notification
        send_real_time_notification(
            target_user_id,
            {
                "type": notif_type,
                "room_id": room_id
            }
        )

        return JsonResponse({"success": True})

    except Exception as e:
        print("MEMBER VIEW ERROR:", e)
        return JsonResponse({"error": str(e)}, status=400)
