from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.contrib.auth.hashers import check_password, make_password
import json
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def change_password_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    user_id = payload["user_id"]

    try:
        data = json.loads(request.body)
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return JsonResponse({"success": False, "message": "All fields are required"}, status=400)

        if new_password != confirm_password:
            return JsonResponse({"success": False, "message": "New passwords do not match"}, status=400)

        # 1. Fetch current password hash
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT password_hash FROM users WHERE user_id = %s", [user_id])
            row = cursor.fetchone()

            if not row:
                return JsonResponse({"success": False, "message": "User not found"}, status=404)

            stored_hash = row[0]

            # 2. Verify current password
            if not check_password(current_password, stored_hash):
                return JsonResponse({"success": False, "message": "Incorrect current password"}, status=400)

            # 3. Hash new password
            new_hash = make_password(new_password)

            # 4. Update password
            cursor.execute("UPDATE users SET password_hash = %s WHERE user_id = %s", [
                           new_hash, user_id])

        return JsonResponse({"success": True, "message": "Password updated successfully"})

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
