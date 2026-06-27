from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import traceback

# Robust import from festival_ops
try:
    from convo.operations.festival_ops import (
        get_gemini_festivals,
        generate_smart_greeting,
        generate_festival_card_designs,
        get_active_festival,
        get_upcoming_festivals,
        get_festival_dashboard_data,
        manage_contribution
    )
except ImportError:
    # Fallback to stubs if imports fail during development
    def get_gemini_festivals(*args, **kwargs):
        return {"success": False, "error": "Import failed"}

    def generate_smart_greeting(*args, **kwargs):
        return {"success": False, "error": "Import failed"}

    def generate_festival_card_designs(*args, **kwargs):
        return {"success": False, "error": "Import failed"}

    def get_active_festival(*args, **kwargs):
        return {"found": False}

    def get_upcoming_festivals(*args, **kwargs):
        return {"success": True, "festivals": []}

    def get_festival_dashboard_data(*args, **kwargs):
        return {"found": False, "status": "none"}

    def manage_contribution(*args, **kwargs):
        return {"success": False}


@csrf_exempt
def gemini_festivals_view(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        year = request.GET.get('year')
        month = request.GET.get('month')
        if year:
            year = int(year)
        result = get_gemini_festivals(year, month)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def greeting_gen_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body)
        festival_name = data.get('festival_name')
        tone = data.get('tone', 'Happy')
        if not festival_name:
            return JsonResponse({"success": False, "error": "festival_name is required"}, status=400)
        result = generate_smart_greeting(
            festival_name=festival_name, tone=tone)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def card_design_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body)
        festival_name = data.get('festival_name')
        if not festival_name:
            return JsonResponse({"success": False, "error": "Festival Name is required"}, status=400)
        result = generate_festival_card_designs(festival_name)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def current_festival_view(request):
    try:
        return JsonResponse(get_active_festival())
    except:
        return JsonResponse({"found": False})


@csrf_exempt
def upcoming_festivals_view(request):
    try:
        return JsonResponse(get_upcoming_festivals())
    except:
        return JsonResponse({"success": True, "festivals": []})


@csrf_exempt
def festival_dashboard_view(request):
    try:
        return JsonResponse(get_festival_dashboard_data())
    except:
        return JsonResponse({"found": False, "status": "none"})


@csrf_exempt
def contribution_view(request):
    return JsonResponse({"error": "Not implemented"}, status=501)
