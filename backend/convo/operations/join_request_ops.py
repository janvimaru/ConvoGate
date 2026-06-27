from django.db import connection


def join_request_action(action, room_id, user_id):
    """
    action: approve | reject
    """
    with connection.cursor() as cursor:
        cursor.callproc(
            "sp_join_room",
            [action, room_id, user_id]
        )
        cursor.fetchall()
