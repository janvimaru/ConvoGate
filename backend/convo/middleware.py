from channels.middleware import BaseMiddleware
from django.db import close_old_connections
import jwt
from django.conf import settings


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()

        headers = {k.decode('utf-8'): v.decode('utf-8')
                   for k, v in scope.get("headers", [])}
        token_header = headers.get('authorization', '')

        scope["user_id"] = None

        if token_header.startswith("Bearer "):
            jwt_token = token_header.split(" ")[1]
            try:
                payload = jwt.decode(
                    jwt_token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                scope["user_id"] = payload.get("user_id")
            except Exception:
                pass

        return await super().__call__(scope, receive, send)
