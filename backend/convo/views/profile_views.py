from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from convo.operations.profile_ops import get_user_profile, update_user_profile, update_profile_pic
import os
from django.conf import settings
import time


@csrf_exempt
def profile_view(request):
    # ... (existing code remains same) ...
    user_id = getattr(request, 'user_id', None)
    if not user_id:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

    if request.method == "GET":
        profile = get_user_profile(user_id)
        if not profile:
            return JsonResponse({"success": False, "message": "Profile not found"}, status=404)
        return JsonResponse(profile)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)

            # Fetch current profile to use as fallback for partial updates
            current_profile = get_user_profile(user_id)
            if not current_profile:
                # This case should ideally not happen if user_id is valid, but good to handle
                return JsonResponse({"success": False, "message": "Profile not found for update"}, status=404)

            # Handle full_name splitting if provided as a single string
            full_name = data.get("full_name", "")

            first_name = data.get(
                "first_name", current_profile.get("first_name", ""))
            last_name = data.get(
                "last_name", current_profile.get("last_name", ""))

            # Only split if full_name is provided and first/last are not explicitly set
            if full_name and not (data.get("first_name") or data.get("last_name")):
                parts = full_name.split(" ", 1)
                first_name = parts[0]
                last_name = parts[1] if len(parts) > 1 else ""

            # Sanitize DOB to avoid Date parsing errors with empty strings
            dob_val = data.get("dob", "")
            if dob_val == "":
                dob_val = None

            update_user_profile(
                user_id,
                first_name,
                last_name,
                data.get("bio", ""),
                data.get("location", ""),
                data.get("status_message", ""),
                phone=data.get("phone", ""),
                dob=dob_val
            )
            return JsonResponse({"success": True, "message": "Profile updated successfully"})
        except Exception as e:
            print(f"❌ PROFILE UPDATE ERROR: {str(e)}")  # Log the error!
            return JsonResponse({"success": False, "message": str(e)}, status=400)

    return JsonResponse({"success": False, "message": "Method not allowed"}, status=405)


@csrf_exempt
def upload_profile_pic_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    user_id = getattr(request, 'user_id', None)
    if not user_id:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

    try:
        pic_file = request.FILES.get("profile_pic")
        if not pic_file:
            return JsonResponse({"success": False, "message": "No file uploaded"}, status=400)

        ext = os.path.splitext(pic_file.name)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            return JsonResponse({"success": False, "message": "Unsupported format"}, status=400)

        upload_dir = os.path.join(settings.BASE_DIR, "media/profiles")
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"user_{user_id}_{int(time.time())}{ext}"
        save_path = os.path.join(upload_dir, filename)

        with open(save_path, "wb+") as f:
            for chunk in pic_file.chunks():
                f.write(chunk)

        # Update DB - store RELATIVE path
        db_path = f"profiles/{filename}"
        update_profile_pic(user_id, db_path)

        return JsonResponse({
            "success": True,
            "profile_pic": db_path,
            "message": "Profile picture updated"
        })

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
