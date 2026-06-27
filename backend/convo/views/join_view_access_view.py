# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.db import connection

# from ..utils.jwt_user import get_user_from_request


# @csrf_exempt
# def join_room_access_view(request, room_id):
#     """
#     User can enter room ONLY if approved
#     """
#     payload, error = get_user_from_request(request)
#     if error:
#         return error

#     user_id = payload["user_id"]

#     with connection.cursor() as cursor:
#         cursor.execute("""
#             SELECT status
#             FROM join_request
#             WHERE room_id = %s AND user_id = %s
#         """, [room_id, user_id])

#         row = cursor.fetchone()

#     if not row or row[0] != "approved":
#         return JsonResponse(
#             {"error": "Join request not approved"},
#             status=403
#         )

#     return JsonResponse({
#         "status": "allowed",
#         "message": "You can join the room"
#     })


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection

from ..utils.jwt_user import get_user_from_request


@csrf_exempt
def join_room_access_view(request, room_id):
    """
    User can enter room ONLY if:
    - user is admin of the room
    - OR join request is approved
    """

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    with connection.cursor() as cursor:
        # ✅ Allow admin directly
        cursor.execute(
            "SELECT admin_user_id FROM chat_rooms WHERE room_id = %s",
            [room_id]
        )
        room = cursor.fetchone()

        if room and room[0] == user_id:
            return JsonResponse({
                "status": "allowed",
                "message": "Admin access granted"
            })

        # ✅ Check join approval
        cursor.execute("""
            SELECT status
            FROM join_request
            WHERE room_id = %s AND user_id = %s
        """, [room_id, user_id])

        row = cursor.fetchone()

    if not row or row[0] != "approved":
        return JsonResponse(
            {"error": "Join request not approved"},
            status=403
        )

    return JsonResponse({
        "status": "allowed",
        "message": "You can join the room"
    })
