from django.db import connection


def room_pin_flow(action, room_id=None, pin=None):
    with connection.cursor() as cursor:
        cursor.callproc(
            "sp_room_pin_flow",
            [action, room_id, pin]
        )

        row = cursor.fetchone()
        if not row:
            return None

        # ✅ GENERATE → (room_pin)
        if action == "generate":
            return {
                "pin": row[0]
            }

        # ✅ VERIFY → (status, room_id, admin_id)
        if action == "verify":
            return {
                "status": row[0],
                "room_id": row[1],
                "admin_id": row[2]
            }

        return None
