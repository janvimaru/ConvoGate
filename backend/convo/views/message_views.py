from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from convo.utils.jwt_user import get_user_from_request
from convo.operations.message_ops import message_flow, get_message_history


# =====================================================
# SEND / EDIT / DELETE MESSAGE
# =====================================================
@csrf_exempt
def message_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    sender_user_id = payload["user_id"]

    try:
        data = json.loads(request.body)

        result = message_flow(
            action=data.get("action"),
            room_id=data.get("room_id"),
            sender_user_id=sender_user_id,
            message_type=data.get("message_type"),
            content=data.get("content"),
            voice_url=data.get("voice_url"),
            message_id=data.get("message_id"),
        )

        return JsonResponse(
            result,
            status=200 if result.get("success") else 400
        )

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)


# =====================================================
# MESSAGE HISTORY (GET)
# =====================================================
@csrf_exempt
def message_history_view(request, room_id):
    if request.method != "GET":
        return JsonResponse({"success": False, "message": "GET required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    # Parse pagination params
    try:
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
    except ValueError:
        limit = 50
        offset = 0

    result = get_message_history(room_id, user_id, limit=limit, offset=offset)

    return JsonResponse(
        result,
        status=200 if result.get("success") else 403
    )
