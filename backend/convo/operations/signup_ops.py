from django.db import connection
from django.contrib.auth.hashers import make_password


def create_user(first_name, last_name, username, dob, phone, email, password, profile_pic=None):
    try:
        password_hash = make_password(password)

        with connection.cursor() as cursor:
            cursor.callproc(
                "create_user",
                [
                    first_name,
                    last_name,
                    username.lower(),
                    dob,
                    phone,
                    email,
                    password_hash,
                    profile_pic
                ]
            )

        return {"success": True}
    except Exception as e:
        return {"success": False, "message": str(e)}
