from django.db import connection


def room_member_flow(action, room_id, user_id, target_user=None):
    try:
        with connection.cursor() as cursor:
            cursor.callproc(
                "sp_room_member_flow",
                [action, room_id, user_id, target_user]
            )
        return {"success": True}
    except Exception as e:
        return {"success": False, "message": str(e)}
