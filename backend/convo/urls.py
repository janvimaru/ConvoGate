from django.urls import path
from django.http import JsonResponse

import os

def api_home(request):
    return JsonResponse({
        "status": "running",
        "app": "ConvoGate API",
        "message": "Backend API is up and running successfully!"
    })

def test_env(request):
    def get_info(key):
        val = os.environ.get(key)
        if val is None:
            return "NOT_SET"
        return {
            "length": len(val),
            "prefix": val[:3] if key != "DB_PASSWORD" else (val[:1] + "**" if val else "")
        }

    return JsonResponse({
        "DB_HOST": get_info("DB_HOST"),
        "DB_PORT": get_info("DB_PORT"),
        "DB_NAME": get_info("DB_NAME"),
        "DB_USER": get_info("DB_USER"),
        "DB_PASSWORD": get_info("DB_PASSWORD"),
    })

from .views.signup_view import signup_view
from .views.login_view import login_view
from .views.room_views import room_view, save_quick_chat_view
from .views.member_views import member_view
from .views.message_views import message_view, message_history_view
from .views.room_join_views import join_room_view
from .views.user_serach_view import user_search_view
from .views.sidebar_views import sidebar_view
from .views.notification_view import notifications_view, mark_read_view, mark_all_read_view, mark_room_read_view
from .views.admin_join_action_view import admin_join_action_view
from .views.join_view_access_view import join_room_access_view
from .views.room_detail_view import room_detail_view   # ✅ ADD
from .views.media_views import upload_chat_media_view, upload_room_avatar_view  # ✅ ADD
from .views.profile_views import profile_view, upload_profile_pic_view  # ✅ ADD
from .views.group_views import create_group_view, group_info_view  # ✅ ADD
from .views.search_views import search_messages_view, manage_starred_view  # ✅ ADD
from .views.translation_views import translate_message_view  # ✅ ADD
from .views.auth_views import change_password_view  # ✅ ADD
from .views.dashboard_view import dashboard_view  # ✅ ADD
from .views.global_search_view import global_search_view  # ✅ ADD
from .views.festival_views import (
    current_festival_view,
    greeting_gen_view,
    contribution_view,
    upcoming_festivals_view,
    festival_dashboard_view,
    card_design_view,
    gemini_festivals_view
)
from .views.expense_views import create_expense_view, expense_action_view, get_expense_view  # ✅ ADD

urlpatterns = [
    path("", api_home),
    path("test-env/", test_env),
    path("auth/change-password/", change_password_view),  # ✅ FIXED
    path("signup/", signup_view),
    path("login/", login_view),

    path("dashboard/", dashboard_view),  # ✅ ADD
    path("search/global/", global_search_view),  # ✅ ADD

    # FESTIVAL
    # path("api/festival/current/", current_festival_view),
    # path("api/festival/dashboard/", festival_dashboard_view),
    # path("api/festival/greeting/", greeting_gen_view),
    # path("api/festival/contribution/", contribution_view),
    # path("api/festival/upcoming/", upcoming_festivals_view),
    # path("api/festival/card-design/", card_design_view),

    path("room/create/", room_view),
    path("room/save-quick-chat/", save_quick_chat_view),  # ✅ ADD
    path("room/member/", member_view),  # approve / reject ONLY
    path("room/join/", join_room_view),

    path("room/<int:room_id>/", room_detail_view),   # ROOM FETCH
    path("room/<int:room_id>/info/", group_info_view),  # ✅ ADD
    path("room/<int:room_id>/search/", search_messages_view),  # ✅ ADD
    path("messages/star/", manage_starred_view),  # ✅ ADD
    path("messages/translate/", translate_message_view),  # ✅ ADD
    path("groups/create/", create_group_view),  # ✅ ADD
    # path("room/<int:room_id>/messages/", message_history_view),

    path("room/access/<int:room_id>/", join_room_access_view),

    path("sidebar/", sidebar_view),
    # path("messages/", message_view),
    path("messages/", message_view),
    path("room/<int:room_id>/messages/", message_history_view),

    path("notifications/", notifications_view),
    path("notifications/mark_read/", mark_read_view),
    path("notifications/mark_all_read/", mark_all_read_view),
    path("api/notifications/", notifications_view),
    path("api/notifications/mark-all-read/", mark_all_read_view),
    path("notifications/mark_room_read/", mark_room_read_view),
    path("api/notifications/mark-room-read/", mark_room_read_view),
    path("users/search/", user_search_view),

    path("room/join-action/", admin_join_action_view),
    path("upload/chat-media/", upload_chat_media_view),  # ✅ ADD
    path("upload/profile-pic/", upload_profile_pic_view),  # ✅ ADD
    path("upload/room-avatar/", upload_room_avatar_view),  # ✅ ADD
    path("profile/", profile_view),  # ✅ ADD
    path("api/user/profile/", profile_view),  # ✅ ADD


    # Add this to your urls.py
    path('api/festival/current/', current_festival_view, name='current_festival'),
    path('api/festival/dashboard/', festival_dashboard_view,
         name='festival_dashboard'),
    path('api/festival/greeting/', greeting_gen_view, name='greeting_gen'),
    path('api/festival/contribution/', contribution_view, name='contribution'),
    path('api/festival/upcoming/', upcoming_festivals_view,
         name='upcoming_festivals'),
    path('api/festival/card-design/', card_design_view, name='card_design'),
    path('api/festival/gemini-festivals/',
         gemini_festivals_view, name='gemini_festivals'),
    # path('api/festival/test-gemini/', test_gemini_view, name='test_gemini'),

    path("api/expenses/create/", create_expense_view),  # ✅ ADD
    path("api/expenses/action/", expense_action_view),  # ✅ ADD
    path("api/expenses/<int:expense_id>/", get_expense_view),  # ✅ ADD
]
