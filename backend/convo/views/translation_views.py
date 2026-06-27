from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
from convo.utils.jwt_user import get_user_from_request
from deep_translator import GoogleTranslator


@csrf_exempt
def translate_message_view(request):
    """
    POST /messages/translate/
    Body: { message_id: 123, target_lang: 'gu' }
    """
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    payload, error = get_user_from_request(request)
    if error:
        return error

    try:
        data = json.loads(request.body)
        message_id = data.get("message_id")
        target_lang = data.get("target_lang")  # 'gu', 'hi'

        if not message_id or not target_lang:
            return JsonResponse({"success": False, "message": "message_id and target_lang required"}, status=400)

        # STRICTLY enforce Hindi, English, and Gujarati
        if target_lang not in ['hi', 'en', 'gu']:
            return JsonResponse({"success": False, "message": "Only Hindi ('hi'), English ('en'), and Gujarati ('gu') translations are supported."}, status=400)

        # 1. Check if translation already exists in DB
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT translated_content FROM message_translations WHERE message_id = %s AND language_code = %s",
                [message_id, target_lang]
            )
            row = cursor.fetchone()
            if row:
                return JsonResponse({"success": True, "translated_content": row[0]})

            # 2. If not, fetch original content
            cursor.execute(
                "SELECT content FROM messages WHERE message_id = %s", [message_id])
            msg_row = cursor.fetchone()
            if not msg_row:
                return JsonResponse({"success": False, "message": "Message not found"}, status=404)

            original_content = msg_row[0]

            # 3. Translate using deep-translator
            try:
                # deep-translator handles 'gu' automatically as google backend supports it
                translated_text = GoogleTranslator(
                    source='auto', target=target_lang).translate(original_content)

                if not translated_text:
                    return JsonResponse({"success": False, "message": "Translation failed to return text"}, status=500)
            except Exception as trans_error:
                return JsonResponse({"success": False, "message": f"Translation service error: {str(trans_error)}"}, status=500)

            # 4. Save to DB using stored procedure
            cursor.callproc("sp_manage_translation", [
                            message_id, target_lang, translated_text])

        return JsonResponse({
            "success": True,
            "translated_content": translated_text
        })

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
