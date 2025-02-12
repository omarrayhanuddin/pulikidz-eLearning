from django.db import models
from django.contrib.auth import get_user_model
from apps.courses.models import Course  # adjust the import as needed

User = get_user_model()

class ChatRoom(models.Model):
    """
    A ChatRoom that is associated with a Course.
    Each Course has a one-to-one relationship with a ChatRoom.
    """
    course = models.OneToOneField(
        Course,
        on_delete=models.CASCADE,
        related_name='chat_room'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatRoom for {self.course.title}"


class ChatMessage(models.Model):
    """
    A ChatMessage stores individual messages sent in a ChatRoom.
    """
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message by {self.sender} in {self.room} at {self.timestamp:%Y-%m-%d %H:%M:%S}"
