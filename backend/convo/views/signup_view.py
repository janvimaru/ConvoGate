from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from convo.operations.signup_ops import create_user


@csrf_exempt
def signup_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        # Expect multipart/form-data
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        username = request.POST.get("username")
        dob = request.POST.get("dob")
        phone = request.POST.get("phone")
        email = request.POST.get("email")
        password = request.POST.get("password")
        profile_pic_file = request.FILES.get("profile_pic")  # file object

        # Validate required fields
        for field in [first_name, last_name, username, dob, phone, email, password]:
            if not field:
                return JsonResponse({"error": f"{field} is required"}, status=400)

        profile_pic_path = None
        if profile_pic_file:
            # Save file to media folder
            import os
            from django.conf import settings
            upload_dir = os.path.join(settings.BASE_DIR, "media/profile_pics")
            os.makedirs(upload_dir, exist_ok=True)
            profile_pic_path = os.path.join(
                "profile_pics", profile_pic_file.name)

            with open(os.path.join(settings.BASE_DIR, "media", profile_pic_path), "wb+") as f:
                for chunk in profile_pic_file.chunks():
                    f.write(chunk)

        # Call your stored procedure
        result = create_user(
            first_name,
            last_name,
            username,
            dob,
            phone,
            email,
            password,
            profile_pic_path
        )

        if result["success"]:
            return JsonResponse({"message": "Signup successful"}, status=201)
        return JsonResponse({"error": result["message"]}, status=400)

    except Exception as e:
        print("SIGNUP ERROR:", str(e))
        return JsonResponse({"error": str(e)}, status=500)
