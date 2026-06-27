from django.db import connection
import json


def message_flow(
    action,
    room_id=None,
    sender_user_id=None,
    message_type=None,
    content=None,
    voice_url=None,
    message_id=None,
    parent_message_id=None,
):
    try:
        with connection.cursor() as cursor:
            cursor.callproc(
                "sp_message_flow",
                [
                    action,
                    message_id,
                    room_id,
                    sender_user_id,
                    message_type,
                    content,
                    voice_url,
                    parent_message_id,
                ],
            )

            # Fetch the newly created message ID and timestamp
            if action == "send":
                cursor.execute(
                    """
                    SELECT message_id, created_at 
                    FROM messages 
                    WHERE room_id = %s AND sender_user_id = %s 
                    ORDER BY message_id DESC LIMIT 1
                    """,
                    [room_id, sender_user_id]
                )
                row = cursor.fetchone()
                if row:
                    new_message_id, created_at = row
                    return {
                        "success": True,
                        "message_id": new_message_id,
                        "created_at": created_at.isoformat()
                    }
                else:
                    return {"success": False, "message": "Message saved but record not found immediately."}

        return {"success": True}

    except Exception as e:
        return {"success": False, "message": str(e)}


def update_message_status(message_id, user_id, status):
    """
    Updates the status of a message for a user (delivered, seen).
    """
    try:
        with connection.cursor() as cursor:
            cursor.callproc("sp_update_message_status", [
                            message_id, user_id, status])
        return {"success": True}
    except Exception as e:
        return {"success": False, "message": str(e)}


def get_message_history(room_id, user_id, limit=50, offset=0):
    """
    Fetch message history including reactions and status for a specific room.
    """
    try:
        with connection.cursor() as cursor:
            # Check room membership first
            cursor.execute(
                "SELECT 1 FROM room_members WHERE room_id = %s AND user_id = %s",
                [room_id, user_id]
            )
            if not cursor.fetchone():
                return {"success": False, "message": "Access denied"}

            # Fetch messages, reactions, status and parent info
            # Optimization: Fetch latest messages using DESC order and LIMIT/OFFSET
            cursor.execute(
                """
                SELECT 
                    m.message_id, 
                    m.room_id, 
                    m.sender_user_id, 
                    u.username AS sender_name,
                    u.profile_pic AS sender_profile_pic,
                    m.message_type, 
                    m.content, 
                    m.voice_url, 
                    m.created_at,
                    m.parent_message_id,
                    (SELECT content FROM messages WHERE message_id = m.parent_message_id) AS parent_content,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'emoji', mr.emoji,
                                'user_id', mr.user_id,
                                'username', ur.username,
                                'profile_pic', ur.profile_pic
                            )
                        )
                        FROM message_reactions mr
                        JOIN users ur ON ur.user_id = mr.user_id
                        WHERE mr.message_id = m.message_id
                    ) AS reactions,
                    (
                        SELECT status 
                        FROM message_status 
                        WHERE message_id = m.message_id 
                        ORDER BY 
                            CASE status 
                                WHEN 'seen' THEN 1 
                                WHEN 'delivered' THEN 2 
                                WHEN 'sent' THEN 3 
                            END ASC 
                        LIMIT 1
                    ) AS combined_status,
                    EXISTS(SELECT 1 FROM starred_messages sm WHERE sm.message_id = m.message_id AND sm.user_id = %s) AS is_starred
                FROM messages m
                JOIN users u ON u.user_id = m.sender_user_id
                WHERE m.room_id = %s
                ORDER BY m.created_at DESC, m.message_id DESC
                LIMIT %s OFFSET %s
                """,
                [user_id, room_id, limit, offset]
            )
            rows = cursor.fetchall()

            # Reverse rows to maintain chronological order (ASC) for frontend
            rows = list(rows)[::-1]

        messages = []
        for r in rows:
            reactions_raw = r[11]
            reactions = []
            if reactions_raw:
                try:
                    reactions = json.loads(reactions_raw)
                except:
                    pass

            messages.append({
                "message_id": r[0],
                "room_id": r[1],
                "sender_user_id": r[2],
                "sender_name": r[3],
                "sender_profile_pic": r[4],
                "message_type": r[5],
                "content": r[6],
                "voice_url": r[7],
                "created_at": r[8],
                "parent_message_id": r[9],
                "parent_content": r[10],
                "reactions": reactions,
                "status": r[12] or 'sent',
                "is_starred": r[13]
            })

        return {
            "success": True,
            "messages": messages,
        }

    except Exception as e:
        return {"success": False, "message": str(e)}
