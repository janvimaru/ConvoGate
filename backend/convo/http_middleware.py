import jwt
from django.conf import settings
from django.http import JsonResponse


class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Get Token from Header
        auth_header = request.headers.get('Authorization')
        request.user_id = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # 2. Decode Token
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                # 3. Attach user_id to request
                request.user_id = payload.get('user_id')
            except jwt.ExpiredSignatureError:
                pass  # Token expired
            except jwt.InvalidTokenError:
                pass  # Invalid token

        # 4. Continue request processing
        response = self.get_response(request)
        return response
