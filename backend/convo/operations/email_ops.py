# from django.core.mail import send_mail
# from django.conf import settings


# def send_room_invite_email(email, room_id, room_name, pin):
#     join_link = f"{settings.FRONTEND_URL}/join-room?room_id={room_id}"

#     send_mail(
#         subject=f"Invite to join room: {room_name}",
#         message=(
#             f"Hello 👋\n\n"
#             f"You are invited to join the room: {room_name}\n\n"
#             f"Room PIN: {pin}\n\n"
#             f"Join using this link:\n{join_link}\n\n"
#             f"If you are not logged in, you will be redirected to login first.\n"
#         ),
#         from_email=settings.DEFAULT_FROM_EMAIL,
#         recipient_list=[email],
#         fail_silently=False
#     )

from django.core.mail import send_mail
from django.conf import settings


def send_room_invite_email(email, room_id, room_name, pin):
    join_url = f"http://localhost:5173/join-room"

    subject = f"You're invited to join {room_name}"

    message = f"""
You have been invited to join the room: {room_name}

Room ID: {room_id}
PIN: {pin}

Join Room:
{join_url}

Thanks,
ConvoGate Team
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
