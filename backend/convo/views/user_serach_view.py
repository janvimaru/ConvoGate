from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json


@csrf_exempt
def user_search_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body)
        query = data.get("query", "").strip()

        with connection.cursor() as cursor:
            if query:
                cursor.execute(
                    """
                    SELECT user_id, username, email
                    FROM users
                    WHERE username LIKE %s OR email LIKE %s
                    LIMIT 20
                    """,
                    [f"%{query}%", f"%{query}%"]
                )
            else:
                cursor.execute(
                    """
                    SELECT user_id, username, email
                    FROM users
                    LIMIT 20
                    """
                )

            users = cursor.fetchall()

        return JsonResponse({
            "success": True,
            "users": [
                {"user_id": u[0], "username": u[1], "email": u[2]}
                for u in users
            ]
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
