# import jwt
# from django.conf import settings
# from django.http import JsonResponse


# def get_user_from_request(request):
#     auth = request.headers.get("Authorization")

#     if not auth or not auth.startswith("Bearer "):
#         return None, JsonResponse(
#             {"error": "Authorization token missing"},
#             status=401
#         )

#     token = auth.split(" ")[1]

#     try:
#         payload = jwt.decode(
#             token,
#             settings.SECRET_KEY,
#             algorithms=["HS256"]
#         )
#         return payload, None

#     except jwt.ExpiredSignatureError:
#         return None, JsonResponse(
#             {"error": "Token expired"},
#             status=401
#         )
#     except jwt.InvalidTokenError:
#         return None, JsonResponse(
#             {"error": "Invalid token"},
#             status=401
#         )
import jwt
from django.conf import settings
from django.http import JsonResponse


# =====================================================
# HTTP REQUEST JWT (for REST APIs)
# =====================================================
def get_user_from_request(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None, JsonResponse(
            {"error": "Authorization header missing"},
            status=401
        )

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        return payload, None

    except jwt.ExpiredSignatureError:
        return None, JsonResponse(
            {"error": "Token expired"},
            status=401
        )

    except jwt.InvalidTokenError:
        return None, JsonResponse(
            {"error": "Invalid token"},
            status=401
        )


# =====================================================
# WEBSOCKET JWT (for Channels)
# =====================================================
def get_user_from_scope(scope):
    try:
        query_string = scope.get("query_string", b"").decode()

        if "token=" not in query_string:
            return None, {"error": "Token missing"}

        token = query_string.split("token=")[1]

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload, None

    except jwt.ExpiredSignatureError:
        return None, {"error": "Token expired"}

    except jwt.InvalidTokenError:
        return None, {"error": "Invalid token"}

    except Exception:
        return None, {"error": "Authentication failed"}
