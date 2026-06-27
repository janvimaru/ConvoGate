from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def notifications_view(request):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                n.notification_id,
                n.type,
                n.room_id,
                n.reference_id,
                n.is_read,
                n.created_at,
                u.username,
                r.room_name
            FROM notifications n
            LEFT JOIN users u ON u.user_id = n.reference_id
            LEFT JOIN chat_rooms r ON r.room_id = n.room_id
            WHERE n.user_id = %s 
            AND (
                n.is_read = 0 
                OR (n.type NOT IN ('message', 'new_message', 'join_request') AND n.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY))
            )
            ORDER BY n.created_at DESC
        """, [user_id])

        rows = cursor.fetchall()
        cols = [col[0] for col in cursor.description]

    data = []
    for row in rows:
        item = dict(zip(cols, row))

        username = item["username"] or "Someone"
        room = item["room_name"] or "the room"

        if item["type"] == "join_request":
            message = f"{username} wants to join {room}"
        elif item["type"] in ["approved", "join_approved"]:
            message = f"Your request to join {room} was approved"
        elif item["type"] in ["rejected", "join_rejected"]:
            message = f"Your request to join {room} was rejected"
        elif item["type"] == "removed":
            message = f"You were removed from {room}"
        elif item["type"] == "message":
            message = f"New message in {room}"
        elif item["type"] == "expiry_warning":
            message = f"Warning: {room} will expire in less than 30 minutes!"
        else:
            message = "New notification"

        item["message"] = message
        data.append(item)

    return JsonResponse({"notifications": data})


@csrf_exempt
def mark_read_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    try:
        data = json.loads(request.body)
        notification_id = data.get("id")

        if not notification_id:
            return JsonResponse({"success": False, "message": "Missing notification id"}, status=400)

        with connection.cursor() as cursor:
            # Ensure the notification belongs to the user
            cursor.execute(
                "UPDATE notifications SET is_read = 1 WHERE notification_id = %s AND user_id = %s",
                [notification_id, user_id]
            )

        return JsonResponse({"success": True})

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def mark_all_read_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE notifications SET is_read = 1 WHERE user_id = %s AND type != 'join_request'",
                [user_id]
            )

        return JsonResponse({"success": True})

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def mark_room_read_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]
    try:
        data = json.loads(request.body)
        room_id = data.get("room_id")
        if not room_id:
            return JsonResponse({"success": False, "message": "Missing room_id"}, status=400)

        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE notifications SET is_read = 1 WHERE user_id = %s AND room_id = %s AND type IN ('message', 'new_message')",
                [user_id, room_id]
            )
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
