import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from convo.operations.room_ops import room_flow, get_group_details
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def create_group_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    try:
        data = json.loads(request.body)
        name = data.get("name")
        description = data.get("description", "")
        avatar = data.get("avatar", "")

        if not name:
            return JsonResponse({"success": False, "message": "Group name required"}, status=400)

        result = room_flow(
            action="create",
            user_id=payload["user_id"],
            room_name=name,
            description=description,
            room_avatar=avatar,
            is_group=1,
            is_private=1  # Groups are private by default in this flow
        )

        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def group_info_view(request, room_id):
    payload, error = get_user_from_request(request)
    if error:
        return error

    if request.method == "GET":
        result = get_group_details(room_id)
        return JsonResponse(result)

    return JsonResponse({"success": False, "message": "Method not allowed"}, status=405)
