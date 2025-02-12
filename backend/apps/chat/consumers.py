import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, ChatMessage
from backend.custom_authentication import TokenManager
from django.contrib.auth import get_user_model
from django.conf import settings
from .serializers import ChatMessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = None
        user_token = self.scope["url_route"]["kwargs"]["token"]
        self.user = await self.get_user(user_token)
        room_group_names = await self.get_group_names()
        for group_name in room_group_names:
            await self.channel_layer.group_add(group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if self.user is not None:
            room_group_names = await self.get_group_names()
            for group_name in room_group_names:
                await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Receive a message from WebSocket, save it, and broadcast to the group.
        Expects JSON data.
        """
        data = json.loads(text_data)
        course_id = data.get("course_id")
        message = data.get("message", "")
        room_group_name = f"chat_{course_id}"
        message = await self.save_message(message, course_id)
        await self.channel_layer.group_send(
            room_group_name,
            {"type": "chat_message", **message},
        )

    async def chat_message(self, event):
        # Send the message to WebSocket.
        del event["type"]
        await self.send(text_data=json.dumps({**event}))

    @database_sync_to_async
    def save_message(self, message, course_id):
        try:
            chat_room, _ = ChatRoom.objects.get_or_create(course_id=course_id)
            message = ChatMessage.objects.create(
                room=chat_room, sender=self.user, message=message
            )
            return {
                "id":message.id,
                "message":message.message,
                "room":message.room.id,
                "timestamp":message.timestamp.strftime("%d/%m/%Y, %H:%M:%S"),
                "sender":{
                    "id":message.sender.id,
                    "name":message.sender.name
                }
            }
        except Exception as e:
            # Log or handle error as needed.
            print("Error saving message:", e)
            self.close()

    @database_sync_to_async
    def get_group_names(self):
        enrolled_courses = self.user.enrolled_courses.all().values_list(
            "course__id", flat=True
        )
        created_course = self.user.courses_created.all().values_list("id", flat=True)
        combined_course_ids = set(list(enrolled_courses) + list(created_course))
        return [f"chat_{cid}" for cid in combined_course_ids]

    async def get_user(self, token):
        try:
            decoded_data = TokenManager.decode_token(token)
            user_id = decoded_data.get("user_id")
            secret_key = decoded_data.get("secret_key")
            user = await User.objects.aget(id=user_id)
            if user.secret_key != secret_key:
                raise Exception("Invalid credentials")
            return user
        except Exception as e:
            await self.close()

    async def send_error_message(self, e):
        errors = str(e)
        if not settings.DEBUG:
            errors = "An error occurred"
        response = {
            "data": errors,
            "action": "error",
        }
        await self.send(json.dumps(response))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = None
        user_token = self.scope["url_route"]["kwargs"]["token"]
        self.user = await self.get_user(user_token)
        self.my_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.my_group_name, self.channel_name)
        self.accept()

    async def receive(self, text_data=None):
        data = json.loads(text_data)
        message = data.get("message", "")
        await self.channel_layer.group_send(
            self.my_group_name, {"type": "chat_message", "message": message}
        )

    async def disconnect(self, code):
        return await super().disconnect(code)

    async def get_user(self, token):
        try:
            decoded_data = TokenManager.decode_token(token)
            user_id = decoded_data.get("user_id")
            secret_key = decoded_data.get("secret_key")
            user = await User.objects.aget(id=user_id)
            if user.secret_key != secret_key:
                raise Exception("Invalid credentials")
            return user
        except Exception as e:
            await self.close()

    async def chat_message(self, event):
        # Send the message to WebSocket.
        del event["type"]
        await self.send(text_data=json.dumps({**event}))
