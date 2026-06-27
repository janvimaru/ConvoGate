from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from convo.utils.jwt_user import get_user_from_request
from django.db import connection
import json


@csrf_exempt
def search_messages_view(request, room_id):
    if request.method != "GET":
        return JsonResponse({"success": False, "message": "GET required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    query = request.GET.get("q", "")
    msg_type = request.GET.get("type", None)

    try:
        with connection.cursor() as cursor:
            cursor.callproc("sp_search_messages", [room_id, query, msg_type])
            columns = [col[0] for col in cursor.description]
            messages = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return JsonResponse({
            "success": True,
            "messages": messages
        })
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def manage_starred_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    try:
        data = json.loads(request.body)
        action = data.get("action")  # 'star' or 'unstar'
        message_id = data.get("message_id")
        user_id = payload.get("user_id")

        if not action or not message_id:
            return JsonResponse({"success": False, "message": "Missing parameters"}, status=400)

        with connection.cursor() as cursor:
            cursor.callproc("sp_manage_starred_message", [
                            action, user_id, message_id])

        return JsonResponse({"success": True, "action": action})
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
