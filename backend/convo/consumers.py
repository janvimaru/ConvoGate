

import json
from datetime import datetime
from urllib.parse import parse_qs

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db import connection

from convo.operations.message_ops import message_flow
from convo.operations.presence_ops import update_user_presence


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = None
        self.user_id = None
        self.room_id = None

        try:
            self.room_id = int(self.scope["url_route"]["kwargs"]["room_id"])
        except (KeyError, ValueError):
            await self.close()
            return

        with open("d:\\ConvoGate\\backend\\debug_ws.log", "a") as f:
            f.write(f"CONNECT: Room {self.room_id}\n")

        query_params = parse_qs(self.scope["query_string"].decode())
        user_ids = query_params.get("user_id", [])
        if user_ids:
            try:
                self.user_id = int(user_ids[0])
            except ValueError:
                pass

        if not self.user_id:
            await self.close()
            return

        member_data = await sync_to_async(self._get_member_info)()
        if not member_data:
            await self.close()
            return

        self.user_name = member_data[0]
        self.profile_pic = member_data[1]

        # Join room group
        self.room_group_name = f"chat_{self.room_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Update presence to Online
        try:
            await sync_to_async(update_user_presence)(self.user_id, True)
            await self._broadcast_status(True)
        except Exception:
            pass

    def _get_member_info(self):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT u.username, u.profile_pic 
                FROM room_members rm
                JOIN users u ON rm.user_id = u.user_id
                WHERE rm.room_id = %s AND rm.user_id = %s
                """,
                [self.room_id, self.user_id]
            )
            return cursor.fetchone()

    async def _broadcast_status(self, is_online):
        """Notify all rooms the user is in about the status change"""
        rooms = await sync_to_async(self._get_user_rooms)()
        for room_id in rooms:
            group_name = f"chat_{room_id}"
            await self.channel_layer.group_send(
                group_name,
                {
                    "type": "user_status",
                    "user_id": self.user_id,
                    "is_online": is_online,
                    "last_seen": datetime.utcnow().isoformat()
                }
            )

    def _get_user_rooms(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT room_id FROM room_members WHERE user_id = %s", [self.user_id])
            return [row[0] for row in cursor.fetchall()]

    async def disconnect(self, close_code):
        if self.user_id:
            # Update presence to Offline
            await sync_to_async(update_user_presence)(self.user_id, False)
            await self._broadcast_status(False)

        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        action = data.get("action", "send_message")

        if action == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_typing",
                    "user_id": self.user_id,
                    "username": self.user_name,
                    "is_typing": data.get("is_typing", True)
                }
            )
            return

        if action == "reaction":
            try:
                message_id = int(data.get("message_id"))
            except (TypeError, ValueError):
                return

            emoji = data.get("emoji")
            reaction_action = data.get(
                "reaction_action", "add")  # 'add' or 'remove'

            if message_id and emoji:
                # Call sp_manage_reaction via sync_to_async
                await sync_to_async(self._manage_reaction)(reaction_action, message_id, emoji)

                # Broadcast reaction to group
                print(
                    f"Broadcasting reaction: {emoji} to {self.room_group_name}")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "message_reaction",
                        "message_id": message_id,
                        "user_id": self.user_id,
                        "emoji": emoji,
                        "action": reaction_action,
                        "username": self.user_name,
                        "profile_pic": self.profile_pic
                    }
                )
            return

        if action in ["message_delivered", "message_seen"]:
            message_id = data.get("message_id")
            status = "delivered" if action == "message_delivered" else "seen"

            if message_id:
                from convo.operations.message_ops import update_message_status
                await sync_to_async(update_message_status)(message_id, self.user_id, status)

                # Broadcast status update
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "message_status_update",
                        "message_id": message_id,
                        "user_id": self.user_id,
                        "status": status
                    }
                )
            return

        # Default: send_message
        message_type = data.get("message_type", "text")
        content = data.get("content")
        parent_message_id = data.get("parent_message_id")

        print(
            f"Server received message: '{content}' for room_id: {self.room_id} from user: {self.user_id}")

        if not content:
            return

        result = await sync_to_async(message_flow)(
            action="send",
            room_id=self.room_id,
            sender_user_id=self.user_id,
            message_type=message_type,
            content=content,
            voice_url=data.get("voice_url"),
            parent_message_id=parent_message_id
        )

        if not result.get("success"):
            await self.send(text_data=json.dumps(result))
            return

        # Broadcast message with DB ID
        new_msg_id = result.get("message_id")
        created_at = result.get("created_at")
        timestamp = created_at or datetime.utcnow().isoformat()

        payload = {
            "type": "chat_message",
            "id": new_msg_id,  # Important for frontend key
            "message_id": new_msg_id,
            "room_id": self.room_id,
            "sender_user_id": self.user_id,
            "sender_name": self.user_name,
            "sender_profile_pic": self.profile_pic,
            "message_type": message_type,
            "content": content,
            "voice_url": data.get("voice_url"),
            "parent_message_id": parent_message_id,
            "timestamp": timestamp,
            "created_at": timestamp,
        }

        await self.channel_layer.group_send(self.room_group_name, payload)

        # 2. Broadcast notification to all members (for those NOT in current room)
        from convo.operations.room_ops import get_group_details
        members_data = await sync_to_async(get_group_details)(self.room_id)
        if members_data.get("success"):
            group_name = members_data.get("group", {}).get(
                "name", f"Room {self.room_id}")
            member_count = len(members_data.get("members", []))
            print(
                f"[ChatConsumer] Broadcasting notification to {member_count - 1} members (excluding sender)")

            for member in members_data.get("members", []):
                member_id = member.get("user_id")
                if member_id == self.user_id:
                    continue

                await self.channel_layer.group_send(
                    f"user_{member_id}",
                    {
                        "type": "send_notification",
                        "data": {
                            "type": "new_message",
                            "room_id": self.room_id,
                            "room_name": group_name,
                            "sender_name": self.user_name,
                            "content": content,
                            "timestamp": timestamp
                        }
                    }
                )
                print(f"[ChatConsumer] Sent notification to user_{member_id}")

    def _manage_reaction(self, action, message_id, emoji):
        with connection.cursor() as cursor:
            cursor.callproc("sp_manage_reaction", [
                            action, message_id, self.user_id, emoji])

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_status(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps(event))

    async def message_reaction(self, event):
        await self.send(text_data=json.dumps(event))

    async def message_status_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def expense_update(self, event):
        await self.send(text_data=json.dumps(event))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from urllib.parse import parse_qs
        with open("d:\\ConvoGate\\backend\\debug_ws.log", "a") as f:
            f.write(f"NOTIF_CONNECT_ATTEMPT: Scope: {self.scope['path']}\n")

        self.user_id = None

        query_params = parse_qs(self.scope["query_string"].decode())
        user_ids = query_params.get("user_id", [])
        if user_ids:
            try:
                self.user_id = int(user_ids[0])
            except ValueError:
                pass

        with open("d:\\ConvoGate\\backend\\debug_ws.log", "a") as f:
            f.write(f"NOTIF_CONNECT_USER: {self.user_id}\n")

        print(f"[NotificationConsumer] Connecting user_id: {self.user_id}")

        if not self.user_id:
            await self.close()
            return

        self.group_name = f"user_{self.user_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def send_notification(self, event):
        # event['data'] contains the actual notification payload
        print(
            f"[NotificationConsumer] Sending to user {self.user_id}: {event['data']}")
        await self.send(text_data=json.dumps(event['data']))


# from datetime import datetime
# from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from asgiref.sync import sync_to_async
# from django.db import connection

# from convo.operations.message_ops import message_flow


# class ChatConsumer(AsyncJsonWebsocketConsumer):
#     """
#     WebSocket URL:
#     ws://127.0.0.1:8000/ws/chat/<room_id>/?user_id=<user_id>
#     """

#     async def connect(self):
#         # ✅ Get room_id from URL
#         self.room_id = int(self.scope["url_route"]["kwargs"]["room_id"])

#         # ✅ Get user_id from query string
#         query_string = self.scope["query_string"].decode()
#         self.user_id = None

#         if "user_id=" in query_string:
#             try:
#                 self.user_id = int(query_string.split("user_id=")[1])
#             except ValueError:
#                 self.user_id = None

#         # 🚫 Block anonymous users
#         if not self.user_id:
#             await self.close()
#             return

#         # 🚫 Check room membership
#         is_member = await sync_to_async(self._is_room_member)()
#         if not is_member:
#             await self.close()
#             return

#         # ✅ Join room group
#         self.room_group_name = f"chat_{self.room_id}"

#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()

#     def _is_room_member(self):
#         """Check if user exists in room_members"""
#         with connection.cursor() as cursor:
#             cursor.execute(
#                 """
#                 SELECT 1
#                 FROM room_members
#                 WHERE room_id = %s AND user_id = %s
#                 """,
#                 [self.room_id, self.user_id]
#             )
#             return cursor.fetchone() is not None

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive_json(self, data):
#         """
#         Expected payload:
#         {
#           "message_type": "text",
#           "content": "Hello"
#         }
#         """

#         message_type = data.get("message_type")
#         content = data.get("content")

#         if not message_type or not content:
#             return

#         # 💾 Save message using stored procedure
#         result = await sync_to_async(message_flow)(
#             action="send",
#             room_id=self.room_id,
#             sender_user_id=self.user_id,
#             message_type=message_type,
#             content=content,
#             voice_url=None
#         )

#         if not result.get("success"):
#             await self.send_json(result)
#             return

#         # 📡 Broadcast to room
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type": "chat_message",
#                 "room_id": self.room_id,
#                 "sender_user_id": self.user_id,
#                 "message_type": message_type,
#                 "content": content,
#                 "timestamp": datetime.utcnow().isoformat()
#             }
#         )

#     async def chat_message(self, event):
#         await self.send_json(event)
