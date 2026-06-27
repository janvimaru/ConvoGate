from django.db import connection


def check_and_update_expired_rooms(user_id):
    """
    Lazy update of room status based on expiry_time.
    1. Unsaved + Expired -> is_active = 0 (Soft Delete)
    2. Saved + Expired -> is_read_only = 1 (Archive Mode)
    """
    with connection.cursor() as cursor:
        # 1. Deactivate Unsaved & Expired Rooms
        cursor.execute("""
            UPDATE chat_rooms 
            SET is_active = 0 
            WHERE expiry_time IS NOT NULL 
            AND expiry_time <= NOW() 
            AND is_saved = 0
            AND is_active = 1
        """)

        # 2. Set Saved & Expired Rooms to Read-Only
        cursor.execute("""
            UPDATE chat_rooms 
            SET is_read_only = 1 
            WHERE expiry_time IS NOT NULL 
            AND expiry_time <= NOW() 
            AND is_saved = 1
            AND is_read_only = 0
        """)

        # 3. Send 30-Minute Expiration Warning
        # Find rooms expiring in < 30 mins that haven't been warned yet
        cursor.execute("""
            SELECT room_id, room_name 
            FROM chat_rooms 
            WHERE expiry_time IS NOT NULL 
            AND expiry_time > NOW() 
            AND expiry_time <= DATE_ADD(NOW(), INTERVAL 30 MINUTE)
            AND expiry_warning_sent = 0
            AND is_active = 1
        """)
        rooms_to_warn = cursor.fetchall()

        if rooms_to_warn:
            from convo.utils.notification_utils import send_real_time_notification

            for room in rooms_to_warn:
                r_id, r_name = room

                # Update flag immediately to prevent duplicate sending
                cursor.execute(
                    "UPDATE chat_rooms SET expiry_warning_sent = 1 WHERE room_id = %s", [r_id])

                # Get Admins
                cursor.execute(
                    "SELECT user_id FROM room_members WHERE room_id = %s AND role = 'admin'", [r_id])
                admins = cursor.fetchall()

                for admin in admins:
                    admin_id = admin[0]
                    # Insert Notification
                    cursor.callproc("sp_notification_flow", [
                                    "create", admin_id, "expiry_warning", r_id, None])

                    # Send Real-Time
                    send_real_time_notification(admin_id, {
                        "type": "expiry_warning",
                        "message": f"Quick chat '{r_name}' expires in less than 30 minutes! Save it to keep it.",
                        "room_id": r_id,
                        "room_name": r_name
                    })


def sidebar_rooms(user_id):
    # Perform lazy expiration check before fetching
    check_and_update_expired_rooms(user_id)

    with connection.cursor() as cursor:
        cursor.callproc("sp_sidebar_rooms", [user_id])

        created = cursor.fetchall()

        cursor.nextset()  # move to 2nd result set
        joined = cursor.fetchall()

    return {
        "created": [
            {
                "id": r[0],
                "name": r[1],
                "avatar": r[2],
                "is_quick_chat": bool(r[3]),
                "expiry_time": r[4].strftime("%Y-%m-%d %H:%M:%S") if r[4] else None,
                "is_read_only": bool(r[5]) if len(r) > 5 else False,
                "last_message": r[6],
                "last_message_time": r[7].strftime("%Y-%m-%d %H:%M:%S") if r[7] else None,
                "unread_count": r[8]
            } for r in created
        ],
        "joined": [
            {
                "id": r[0],
                "name": r[1],
                "avatar": r[2],
                "is_quick_chat": bool(r[3]),
                "expiry_time": r[4].strftime("%Y-%m-%d %H:%M:%S") if r[4] else None,
                "is_read_only": bool(r[5]) if len(r) > 5 else False,
                "last_message": r[6],
                "last_message_time": r[7].strftime("%Y-%m-%d %H:%M:%S") if r[7] else None,
                "unread_count": r[8]
            } for r in joined
        ]
    }
