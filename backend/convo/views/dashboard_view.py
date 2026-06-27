from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def dashboard_view(request):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    try:
        with connection.cursor() as cursor:
            # 1. Total Messages Sent by User
            cursor.execute(
                "SELECT COUNT(*) FROM messages WHERE sender_user_id = %s", [user_id])
            total_messages = cursor.fetchone()[0]

            # 2. Active Rooms (Joined)
            cursor.execute(
                "SELECT COUNT(*) FROM room_members WHERE user_id = %s", [user_id])
            active_rooms = cursor.fetchone()[0]

            # 3. Created Rooms
            cursor.execute(
                "SELECT COUNT(*) FROM chat_rooms WHERE admin_user_id = %s", [user_id])
            created_rooms = cursor.fetchone()[0]

            # 4. Recent Rooms (Limit 5)
            # Fetch joined rooms ordered by last message or created date with unread count and dynamic avatar
            cursor.execute("""
                SELECT 
                    r.room_id, 
                    r.room_name, 
                    CASE 
                        WHEN r.is_group = 1 THEN r.room_avatar 
                        ELSE (
                            SELECT u.profile_pic FROM room_members rm2
                            JOIN users u ON rm2.user_id = u.user_id
                            WHERE rm2.room_id = r.room_id AND rm2.user_id != %s
                            LIMIT 1
                        )
                    END AS avatar,
                    (SELECT content FROM messages m WHERE m.room_id = r.room_id ORDER BY created_at DESC LIMIT 1) as last_msg,
                    (SELECT created_at FROM messages m WHERE m.room_id = r.room_id ORDER BY created_at DESC LIMIT 1) as last_time,
                    (SELECT COUNT(*) FROM messages msg 
                     LEFT JOIN message_status ms ON msg.message_id = ms.message_id AND ms.user_id = %s
                     WHERE msg.room_id = r.room_id 
                     AND (ms.status IS NULL OR ms.status != 'seen')
                    ) AS unread_count
                FROM chat_rooms r
                JOIN room_members rm ON r.room_id = rm.room_id
                WHERE rm.user_id = %s
                AND (r.expiry_time IS NULL OR r.expiry_time > NOW() OR r.is_saved = 1)
                ORDER BY last_time DESC
                LIMIT 5
            """, [user_id, user_id, user_id])

            recent_rooms = []
            for row in cursor.fetchall():
                recent_rooms.append({
                    "id": row[0],
                    "name": row[1],
                    "avatar": row[2],
                    "lastMessage": row[3] or "No messages yet",
                    "time": row[4].strftime("%Y-%m-%d %H:%M") if row[4] else "",
                    "unread": row[5]
                })

            # 5. Calculate Engagement Rate
            # Simplified but dynamic: (Total Messages in all rooms * 2) + (Active Rooms * 10) capped at 100
            score = 0
            if active_rooms > 0:
                score = min(100, (total_messages * 2) + (active_rooms * 10))

            engagement_rate = f"{score}%"

        return JsonResponse({
            "success": True,
            "stats": {
                "total_messages": total_messages,
                "active_rooms": active_rooms,
                "created_rooms": created_rooms,
                "engagement_rate": engagement_rate
            },
            "recent_rooms": recent_rooms
        })

    except Exception as e:
        print("DASHBOARD ERROR:", e)
        return JsonResponse({"error": str(e)}, status=500)
