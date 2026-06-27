# from django.db import connection
# from .room_pin_ops import room_pin_flow


# def room_flow(
#     action,
#     user_id,
#     room_id=None,
#     room_name=None,
#     is_private=0,
#     max_members=50,
#     allow_invites=1,
#     has_password=0
# ):
#     try:
#         with connection.cursor() as cursor:
#             cursor.callproc(
#                 "sp_room_flow",
#                 [
#                     action,
#                     room_id,
#                     room_name,
#                     user_id,
#                     is_private,
#                     max_members,
#                     allow_invites,
#                     has_password
#                 ]
#             )

#             if action == "create":
#                 room_id = cursor.fetchone()[0]

#         # 🔐 Generate PIN (admin only)
#         pin_result = room_pin_flow("generate", room_id=room_id)

#         return {
#             "success": True,
#             "room_id": room_id,
#             "pin": pin_result["pin"]
#         }

#     except Exception as e:
#         return {"success": False, "message": str(e)}


from django.db import connection


def room_flow(
    action,
    user_id,
    room_id=None,
    room_name=None,
    is_private=0,
    max_members=50,
    allow_invites=1,
    has_password=0,
    description=None,
    room_avatar=None,
    is_group=0,
    is_quick_chat=0,
    expiry_hours=None
):
    try:
        with connection.cursor() as cursor:
            cursor.callproc(
                "sp_room_flow",
                [
                    action,
                    room_id,
                    room_name,
                    user_id,
                    is_private,
                    max_members,
                    allow_invites,
                    has_password,
                    description,
                    room_avatar,
                    is_group,
                    is_quick_chat,
                    expiry_hours
                ]
            )

            # ✅ CREATE returns (room_id, pin)
            if action == "create":
                row = cursor.fetchone()
                if not row:
                    raise Exception("Room creation failed")

                room_id, pin = row

                return {
                    "success": True,
                    "room_id": room_id,
                    "pin": pin
                }

            # ✅ UPDATE implementation
            elif action == "update":
                if not room_id:
                    return {"success": False, "message": "room_id required for update"}

                update_fields = []
                params = []

                if room_name:
                    update_fields.append("room_name = %s")
                    params.append(room_name)
                if description is not None:
                    update_fields.append("description = %s")
                    params.append(description)
                if room_avatar:
                    update_fields.append("room_avatar = %s")
                    params.append(room_avatar)

                if not update_fields:
                    return {"success": True, "message": "Nothing to update"}

                query = f"UPDATE chat_rooms SET {', '.join(update_fields)} WHERE room_id = %s"
                params.append(room_id)

                cursor.execute(query, params)
                return {"success": True}

        return {"success": True}

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


def get_group_details(room_id):
    """
    Fetches group info and member list.
    """
    try:
        with connection.cursor() as cursor:
            cursor.callproc('sp_get_group_details', [room_id])

            # 1. Group Info
            room_row = cursor.fetchone()
            if not room_row:
                return {"success": False, "message": "Group not found"}

            group_info = {
                "id": room_row[0],
                "name": room_row[1],
                "is_group": bool(room_row[2]),
                "description": room_row[3],
                "avatar": room_row[4],
                "admin_id": room_row[5],
                "is_private": bool(room_row[6]),
                "created_at": room_row[7]
            }

            # 2. Members
            cursor.nextset()
            member_rows = cursor.fetchall()
            members = []
            for m in member_rows:
                members.append({
                    "user_id": m[0],
                    "username": m[1],
                    "first_name": m[2],
                    "last_name": m[3],
                    "avatar": m[4],
                    "role": m[5],
                    "joined_at": m[6],
                    "status_message": m[7],
                    "is_online": bool(m[8])
                })

            return {
                "success": True,
                "group": group_info,
                "members": members
            }
    except Exception as e:
        return {"success": False, "message": str(e)}


def save_quick_chat(room_id, user_id):
    try:
        with connection.cursor() as cursor:
            # 1. Check if user is ADMIN of this room
            cursor.execute("""
                SELECT 1 FROM room_members 
                WHERE room_id = %s AND user_id = %s AND role = 'admin'
            """, [room_id, user_id])
            if not cursor.fetchone():
                return {"success": False, "message": "You are not an admin of this room"}

            # 2. Toggle is_saved
            cursor.execute(
                "SELECT is_saved, expiry_time FROM chat_rooms WHERE room_id = %s", [room_id])
            row = cursor.fetchone()
            if not row:
                return {"success": False, "message": "Room not found"}

            current_saved = row[0]
            # expiry_time = row[1]
            new_saved = 1 if current_saved == 0 else 0

            # 3. Update DB
            cursor.execute("UPDATE chat_rooms SET is_saved = %s WHERE room_id = %s", [
                           new_saved, room_id])

            # 4. Handle Expiration Logic immediately
            is_active_status = 1
            is_read_only_status = 0

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

            return {
                "success": True,
                "is_saved": bool(new_saved),
                "is_active": bool(is_active_status),
                "is_read_only": bool(is_read_only_status)
            }

    except Exception as e:
        return {"success": False, "message": str(e)}
