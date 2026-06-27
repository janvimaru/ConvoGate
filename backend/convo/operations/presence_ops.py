from django.db import connection


def update_user_presence(user_id, is_online):
    """
    Call sp_update_presence to set user online/offline status.
    """
    try:
        with connection.cursor() as cursor:
            cursor.callproc("sp_update_presence", [user_id, is_online])
        return {"success": True}
    except Exception as e:
        return {"success": False, "message": str(e)}


def get_user_presence(user_id):
    """
    Fetch raw presence data for a user.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT is_online, last_seen FROM users WHERE user_id = %s",
                [user_id]
            )
            row = cursor.fetchone()
            if row:
                return {
                    "success": True,
                    "is_online": bool(row[0]),
                    "last_seen": row[1]
                }
            return {"success": False, "message": "User not found"}
    except Exception as e:
        return {"success": False, "message": str(e)}
