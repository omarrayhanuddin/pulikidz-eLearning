from rest_framework import generics, permissions
from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMessageSerializer

class ChatRoomDetail(generics.RetrieveAPIView):
    """
    Retrieve the chat room associated with a course.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatRoomSerializer
    lookup_field = 'course_id'

    def get_queryset(self):
        return ChatRoom.objects.all()


class ChatMessageList(generics.ListAPIView):
    """
    List all chat messages for a given course (by course id).
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        course_id = self.kwargs.get("course_id")
        return ChatMessage.objects.filter(room__course__id=course_id).order_by("timestamp")
