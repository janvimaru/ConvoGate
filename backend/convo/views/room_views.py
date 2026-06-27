from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.db import connection

from convo.operations.room_ops import room_flow
from convo.operations.email_ops import send_room_invite_email
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def room_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    try:
        data = json.loads(request.body or "{}")

        if data.get("action") != "create":
            return JsonResponse({"error": "Invalid action"}, status=400)

        user_id = payload["user_id"]

        # 1️⃣ CREATE ROOM
        result = room_flow(
            action="create",
            user_id=user_id,
            room_name=data.get("name"),
            is_private=int(data.get("isPrivate", 0)),
            max_members=int(data.get("maxMembers", 50)),
            allow_invites=int(data.get("allowInvites", 1)),
            has_password=int(data.get("hasPassword", 0)),
            is_quick_chat=int(data.get("isQuickChat", 0)),
            expiry_hours=data.get("expiryHours")
        )

        if not result.get("success"):
            return JsonResponse({"error": result.get("message")}, status=400)

        room_id = result["room_id"]
        pin = result["pin"]

        invited_users = data.get("invitedUsers") or []
        invite_all = bool(data.get("inviteAll", True))

        emails = []

        # 2️⃣ FETCH EMAILS (100% SAFE)
        with connection.cursor() as cursor:

            if invite_all:
                cursor.execute("""
                    SELECT email FROM users
                    WHERE email IS NOT NULL AND email != ''
                    AND user_id != %s
                """, [user_id])
                emails = cursor.fetchall()

            elif len(invited_users) > 0:
                cursor.execute("""
                    SELECT email FROM users
                    WHERE user_id IN %s
                    AND email IS NOT NULL AND email != ''
                """, [tuple(invited_users)])
                emails = cursor.fetchall()

        # 3️⃣ SEND EMAILS (SAFE LOOP)
        for (email,) in emails:
            try:
                send_room_invite_email(
                    email=email,
                    room_id=room_id,
                    room_name=data.get("name"),
                    pin=pin
                )
            except Exception as e:
                print("EMAIL SEND FAILED:", email, e)

        return JsonResponse({
            "success": True,
            "room_id": room_id,
            "pin": pin
        }, status=201)

    except Exception as e:
        print("ROOM CREATE ERROR (FATAL):", e)
        return JsonResponse({"error": "Room creation failed"}, status=500)


@csrf_exempt
def save_quick_chat_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    try:
        data = json.loads(request.body or "{}")
        room_id = data.get("roomId")

        if not room_id:
            return JsonResponse({"error": "Room ID required"}, status=400)

        # Import locally to avoid circular import if any (though ops structure prevents it usually)
        from convo.operations.room_ops import save_quick_chat

        result = save_quick_chat(room_id, payload["user_id"])

        if result["success"]:
            return JsonResponse(result)
        return JsonResponse({"error": result.get("message")}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
