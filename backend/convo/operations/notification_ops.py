# convo/operations/notification_ops.py
from django.db import connection


def notification_flow(action, user_id, notif_type=None, room_id=None, reference_id=None):
    try:
        with connection.cursor() as cursor:
            cursor.callproc(
                "sp_notification_flow",
                [action, user_id, notif_type, room_id, reference_id]
            )
    except Exception as e:
        return {"success": False, "message": str(e)}
    return {"success": True}
