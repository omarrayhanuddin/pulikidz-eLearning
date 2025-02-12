from rest_framework import serializers
from .models import ChatRoom, ChatMessage
from apps.users.serializers import ProfileSerializer


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["id", "course", "created_at"]


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = ProfileSerializer()  # Show sender's username

    class Meta:
        model = ChatMessage
        fields = ["id", "room", "sender", "message", "timestamp"]