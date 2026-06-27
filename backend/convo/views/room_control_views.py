from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def toggle_save_room_view(request):
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
            # 1. Check if user is ADMIN of this room
            cursor.execute("""
                SELECT 1 FROM room_members 
                WHERE room_id = %s AND user_id = %s AND role = 'admin'
            """, [room_id, user_id])
            if not cursor.fetchone():
                return JsonResponse({"success": False, "message": "You are not an admin of this room"}, status=403)

            # 2. Toggle is_saved
            # db_saved value: 0 or 1
            cursor.execute(
                "SELECT is_saved, expiry_time FROM chat_rooms WHERE room_id = %s", [room_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({"success": False, "message": "Room not found"}, status=404)

            current_saved = row[0]
            new_saved = 1 if current_saved == 0 else 0

            # 3. Update DB
            cursor.execute("UPDATE chat_rooms SET is_saved = %s WHERE room_id = %s", [
                           new_saved, room_id])

            # 4. Handle Expiration Logic immediately
            # If expired...
            #    Saving -> Read Only
            #    Unsaving -> Deactive (Disappear)

            is_active_status = 1
            is_read_only_status = 0

            # Check expiry
            # We need to compare with DB NOW() to be safe or python time
            # Let's use SQL for safety or just re-run lazy check?
            # Re-running logic explicitly here is safer.

            cursor.execute(
                "SELECT 1 FROM chat_rooms WHERE room_id = %s AND expiry_time <= NOW()", [room_id])
            is_expired = cursor.fetchone() is not None

            if is_expired:
                if new_saved == 1:
                    # Saved + Expired = Read Only
                    cursor.execute(
                        "UPDATE chat_rooms SET is_read_only = 1, is_active = 1 WHERE room_id = %s", [room_id])
                    is_read_only_status = 1
                else:
                    # Unsaved + Expired = Deactive
                    cursor.execute(
                        "UPDATE chat_rooms SET is_active = 0 WHERE room_id = %s", [room_id])
                    is_active_status = 0

            return JsonResponse({
                "success": True,
                "is_saved": bool(new_saved),
                "is_active": bool(is_active_status),
                "is_read_only": bool(is_read_only_status)
            })

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
