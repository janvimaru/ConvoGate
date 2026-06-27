from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings
from convo.utils.jwt_user import get_user_from_request


@csrf_exempt
def upload_chat_media_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    try:
        media_file = request.FILES.get("media")
        if not media_file:
            return JsonResponse({"success": False, "message": "No file uploaded"}, status=400)

        ext = os.path.splitext(media_file.name)[1].lower()
        allowed_extensions = [
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            ".mp4", ".webm", ".wav", ".mp3",
            ".pdf", ".docx", ".txt"
        ]
        if ext not in allowed_extensions:
            return JsonResponse({"success": False, "message": "Unsupported file format"}, status=400)

        upload_dir = os.path.join(settings.BASE_DIR, "media/chat_media")
        os.makedirs(upload_dir, exist_ok=True)

        # Unique filename using timestamp
        import time
        filename = f"{int(time.time())}_{media_file.name}"
        save_path = os.path.join(upload_dir, filename)

        with open(save_path, "wb+") as f:
            for chunk in media_file.chunks():
                f.write(chunk)

        media_url = f"{settings.API_BASE if hasattr(settings, 'API_BASE') else 'http://127.0.0.1:8000'}/media/chat_media/{filename}"

        return JsonResponse({
            "success": True,
            "media_url": media_url,
            "filename": filename
        })

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def upload_room_avatar_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    try:
        room_id = request.POST.get("room_id")
        media_file = request.FILES.get("media")

        if not room_id or not media_file:
            return JsonResponse({"success": False, "message": "room_id and media required"}, status=400)

        user_id = payload["user_id"]

        # 1. Admin Check
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT admin_user_id FROM chat_rooms WHERE room_id = %s", [room_id])
            row = cursor.fetchone()
            if not row or row[0] != user_id:
                return JsonResponse({"success": False, "message": "Only the admin can change room avatar"}, status=403)

        # 2. Upload Logic
        ext = os.path.splitext(media_file.name)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
            return JsonResponse({"success": False, "message": "Unsupported image format"}, status=400)

        upload_dir = os.path.join(settings.BASE_DIR, "media/room_avatars")
        os.makedirs(upload_dir, exist_ok=True)

        import time
        filename = f"room_{room_id}_{int(time.time())}{ext}"
        save_path = os.path.join(upload_dir, filename)

        with open(save_path, "wb+") as f:
            for chunk in media_file.chunks():
                f.write(chunk)

        media_url = f"{settings.API_BASE if hasattr(settings, 'API_BASE') else 'http://127.0.0.1:8000'}/media/room_avatars/{filename}"

        # 3. Update Room
        from convo.operations.room_ops import room_flow
        room_flow(action="update", user_id=user_id,
                  room_id=room_id, room_avatar=media_url)

        return JsonResponse({
            "success": True,
            "media_url": media_url
        })

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
