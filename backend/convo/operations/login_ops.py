from django.db import connection
from django.contrib.auth.hashers import check_password


def login_user(username, password):
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT user_id, first_name, last_name, username, password_hash, profile_pic
                FROM users
                WHERE username = %s
                """,
                [username.lower()]
            )
            user = cursor.fetchone()

        if not user:
            return {"success": False, "message": "User not found"}

        user_id, first_name, last_name, username, password_hash, profile_pic = user

        if not check_password(password, password_hash):
            return {"success": False, "message": "Invalid password"}

        full_name = f"{first_name} {last_name}"

        return {
            "success": True,
            "user": {
                "user_id": user_id,
                "full_name": full_name,
                "username": username,
                "profile_pic": profile_pic
            }
        }

    except Exception as e:
        return {"success": False, "message": str(e)}
