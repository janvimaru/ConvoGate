from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, transaction
import json

from convo.utils.jwt_user import get_user_from_request
from convo.operations.notification_ops import notification_flow
from convo.utils.notification_utils import send_real_time_notification


@csrf_exempt
def admin_join_action_view(request):

    # ✅ METHOD CHECK
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    # ✅ AUTH (THIS IS THE FIX)
    payload, error = get_user_from_request(request)
    if error:
        return error

    admin_user_id = payload["user_id"]   # ✅ FIXED

    # ✅ PAYLOAD
    try:
        data = json.loads(request.body)
        room_id = int(data["room_id"])
        target_user_id = int(data["user_id"])
        action = data["action"]
    except Exception:
        return JsonResponse({"error": "Invalid payload"}, status=400)

    if action not in ["approve", "reject"]:
        return JsonResponse({"error": "Invalid action"}, status=400)

    # ✅ VERIFY ADMIN OWNS ROOM
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT admin_user_id FROM chat_rooms WHERE room_id = %s",
            [room_id]
        )
        row = cursor.fetchone()

    if not row or row[0] != admin_user_id:
        return JsonResponse(
            {"error": "Not authorized"},
            status=403
        )

    # ✅ STORED PROCEDURE
    try:
        with connection.cursor() as cursor:
            cursor.callproc(
                "sp_join_room",
                [action, room_id, target_user_id]
            )
            cursor.fetchall()
    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )

    # ✅ MARK ORIGINAL REQUEST AS READ (Optimization)
    # This prevents the "Request to Join" from persisting as "Unread" for the admin
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE notifications 
            SET is_read = 1 
            WHERE type = 'join_request' 
            AND reference_id = %s 
            AND room_id = %s
            AND user_id = %s
        """, [target_user_id, room_id, admin_user_id])

    # ✅ NOTIFICATION
    notif_type = "join_approved" if action == "approve" else "join_rejected"

    notification_flow(
        action="create",
        user_id=target_user_id,
        notif_type=notif_type,
        room_id=room_id,
        reference_id=admin_user_id
    )

    # Fetch details for real-time notification
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT room_name FROM chat_rooms WHERE room_id = %s", [room_id])
        res_r = cursor.fetchone()
        room_name = res_r[0] if res_r else "a room"

    send_real_time_notification(target_user_id, {
        "type": notif_type,
        "room_id": room_id,
        "room_name": room_name
    })

    return JsonResponse({
        "success": True,
        "action": action
    })
