from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from convo.utils.jwt_user import get_user_from_request
from convo.operations.sidebar_ops import sidebar_rooms


@csrf_exempt
def sidebar_view(request):
    try:
        payload, error = get_user_from_request(request)
        if error:
            return error
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Auth crashed: " + str(e)}, status=500)

    try:
        data = sidebar_rooms(payload["user_id"])
        return JsonResponse({
            "success": True,
            "created": data["created"],
            "joined": data["joined"]
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {"success": False, "error": str(e)},
            status=500
        )
