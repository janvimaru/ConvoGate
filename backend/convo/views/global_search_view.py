from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def global_search_view(request):
    try:
        if request.method != "GET":
            return JsonResponse({"error": "Invalid request"}, status=405)

        payload, error = get_user_from_request(request)
        if error:
            return error

        user_id = payload["user_id"]
        query = request.GET.get("q", "").strip()

        if not query:
            return JsonResponse({"success": True, "users": [], "rooms": [], "messages": []})

        results = {"users": [], "rooms": [], "messages": []}
        search_term = f"%{query}%"

        with connection.cursor() as cursor:

            # 1. SEARCH USERS
            try:
                cursor.execute("""
                    SELECT user_id, username, first_name, last_name, profile_pic 
                    FROM users 
                    WHERE username LIKE %s OR first_name LIKE %s OR last_name LIKE %s
                    LIMIT 10
                """, [search_term, search_term, search_term])

                for row in cursor.fetchall():
                    results["users"].append({
                        "id": row[0],
                        "username": row[1],
                        "first_name": row[2] or "",
                        "last_name": row[3] or "",
                        "full_name": f"{row[2] or ''} {row[3] or ''}".strip() or row[1],
                        "profile_pic": row[4]
                    })
            except Exception as user_err:
                print(f"SEARCH USERS ERROR: {user_err}")
                results["error_users"] = str(user_err)

            # 2. SEARCH ROOMS (rooms the user is a member of, or public rooms)
            try:
                cursor.execute("""
                    SELECT DISTINCT r.room_id, r.room_name, r.room_avatar, r.is_private
                    FROM chat_rooms r
                    LEFT JOIN room_members rm ON r.room_id = rm.room_id AND rm.user_id = %s
                    WHERE (r.room_name LIKE %s)
                    AND (r.is_private = 0 OR rm.user_id IS NOT NULL)
                    LIMIT 10
                """, [user_id, search_term])

                for row in cursor.fetchall():
                    results["rooms"].append({
                        "id": row[0],
                        "name": row[1],
                        "avatar": row[2],
                        "is_private": bool(row[3])
                    })
            except Exception as room_err:
                print(f"SEARCH ROOMS ERROR: {room_err}")
                results["error_rooms"] = str(room_err)

            # 3. SEARCH MESSAGES (only in rooms the user is a member of)
            try:
                cursor.execute("""
                    SELECT m.message_id, m.content, m.created_at, r.room_id, r.room_name, u.username
                    FROM messages m
                    JOIN chat_rooms r ON m.room_id = r.room_id
                    JOIN room_members rm ON r.room_id = rm.room_id AND rm.user_id = %s
                    JOIN users u ON m.sender_user_id = u.user_id
                    WHERE m.content LIKE %s
                    AND m.message_type = 'text'
                    ORDER BY m.created_at DESC
                    LIMIT 10
                """, [user_id, search_term])

                for row in cursor.fetchall():
                    created_at = row[2]
                    if created_at and not isinstance(created_at, str):
                        try:
                            created_at = created_at.strftime("%Y-%m-%d %H:%M")
                        except:
                            created_at = str(created_at)

                    results["messages"].append({
                        "id": row[0],
                        "content": row[1],
                        "created_at": str(created_at) if created_at else "",
                        "room_id": row[3],
                        "room_name": row[4],
                        "sender": row[5]
                    })
            except Exception as msg_err:
                print(f"SEARCH MESSAGES ERROR: {msg_err}")
                results["error_messages"] = str(msg_err)

        return JsonResponse({"success": True, **results})

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print("GLOBAL SEARCH FATAL ERROR:", e)
        print(error_trace)
        return JsonResponse({
            "success": False,
            "error": str(e),
            "traceback": error_trace
        }, status=500)
