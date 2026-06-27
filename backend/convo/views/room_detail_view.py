from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from datetime import datetime

from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def room_detail_view(request, room_id):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    try:
        with connection.cursor() as cursor:

            # ✅ CHECK USER IS MEMBER
            cursor.execute("""
                SELECT 1
                FROM room_members
                WHERE room_id = %s AND user_id = %s
            """, [room_id, user_id])

            if cursor.fetchone() is None:
                return JsonResponse(
                    {"error": "Access denied"},
                    status=403
                )

            # ✅ FETCH ROOM DETAILS
            cursor.execute("""
                SELECT
                    r.room_id,
                    r.room_name,
                    r.is_private,
                    COUNT(m.user_id) AS member_count,
                    r.is_group,
                    r.description,
                    r.room_avatar,
                    r.is_quick_chat,
                    r.expiry_time,
                    r.is_read_only,
                    r.admin_user_id,
                    r.is_saved,
                    r.created_at
                FROM chat_rooms r
                LEFT JOIN room_members m ON r.room_id = m.room_id
                WHERE r.room_id = %s
                GROUP BY r.room_id
            """, [room_id])

            room_row = cursor.fetchone()

            if not room_row:
                return JsonResponse({"error": "Room not found"}, status=404)

            # ✅ CHECK IF ROOM IS EXPIRED AND NOT SAVED (Block access)
            # Index mapping: 0: room_id, 1: room_name, 2: is_private, 3: member_count, 4: is_group, 5: description, 6: room_avatar, 7: is_quick_chat, 8: expiry_time, 9: is_read_only, 10: admin_user_id, 11: is_saved, 12: created_at
            expiry_time = room_row[8] if len(room_row) > 8 else None
            is_saved = bool(room_row[11]) if len(room_row) > 11 else False

            if expiry_time and expiry_time < datetime.now() and not is_saved:
                return JsonResponse(
                    {"error": "This room has expired and is no longer accessible"},
                    status=403
                )

            # ✅ FETCH RECIPIENT STATUS FOR PRIVATE CHATS
            status_info = {}
            if bool(room_row[2]):  # is_private
                cursor.execute("""
                    SELECT 
                        u.is_online,
                        u.last_seen,
                        p.status_message
                    FROM room_members rm
                    JOIN users u ON rm.user_id = u.user_id
                    LEFT JOIN user_profiles p ON u.user_id = p.user_id
                    WHERE rm.room_id = %s AND rm.user_id != %s
                    LIMIT 1
                """, [room_id, user_id])

                status_row = cursor.fetchone()
                if status_row:
                    status_info = {
                        "is_online": bool(status_row[0]),
                        "last_seen": status_row[1].strftime("%Y-%m-%d %H:%M:%S") if status_row[1] else None,
                        "status_message": status_row[2] or ""
                    }

        return JsonResponse({
            "room": {
                "id": room_row[0],
                "name": room_row[1],
                "isPrivate": bool(room_row[2]),
                "memberCount": room_row[3],
                "isGroup": bool(room_row[4]),
                "description": room_row[5],
                "roomAvatar": room_row[6],
                "isQuickChat": bool(room_row[7]) if len(room_row) > 7 else False,
                "expiryTime": room_row[8].strftime("%Y-%m-%d %H:%M:%S") if len(room_row) > 8 and room_row[8] else None,
                # Read-Only if explicitly set OR if expired
                "isReadOnly": bool(room_row[9]) or (room_row[8] and room_row[8] < datetime.now()),
                "adminUserId": room_row[10] if len(room_row) > 10 else None,
                "isSaved": bool(room_row[11]) if len(room_row) > 11 else False,
                "created_at": room_row[12].strftime("%Y-%m-%d %H:%M:%S") if len(room_row) > 12 and room_row[12] else None,
                **status_info
            }
        })

    except Exception as e:
        print("ROOM DETAIL ERROR:", e)
        return JsonResponse(
            {"error": str(e)},
            status=500
        )
