from django.core.mail import EmailMessage
from django.conf import settings


def send_room_invite_email(email, room_id, room_name, pin, creator_name, creator_email=None):
    join_url = f"{settings.FRONTEND_URL}/join-room"

    subject = f"{creator_name} invited you to join {room_name}"

    message = f"""Hello 👋

{creator_name} has invited you to join the room: {room_name}

Room ID: {room_id}
PIN: {pin}

Join Room:
{join_url}

Thanks,
ConvoGate Team
"""

    # Format the sender display name: "Name via ConvoGate <system_email>"
    from_email = f'"{creator_name} via ConvoGate" <{settings.DEFAULT_FROM_EMAIL}>'

    msg = EmailMessage(
        subject=subject,
        body=message,
        from_email=from_email,
        to=[email],
        reply_to=[creator_email] if creator_email else None,
    )
    msg.send(fail_silently=False)
