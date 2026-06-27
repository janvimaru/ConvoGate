from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from convo.operations.login_ops import login_user
from convo.utils.jwt_utils import generate_jwt


@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse({"error": "Username and password required"}, status=400)

        result = login_user(username, password)

        if not result["success"]:
            return JsonResponse({"error": result["message"]}, status=400)

        user = result["user"]

        # Use new key user_id instead of id
        token = generate_jwt(user["user_id"], user["username"])

        return JsonResponse({
            "message": "Login successful",
            "token": token,
            "user": user
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
