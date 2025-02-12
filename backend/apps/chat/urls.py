from django.urls import path
from .views import ChatRoomDetail, ChatMessageList

urlpatterns = [
    path('rooms/<int:course_id>/', ChatRoomDetail.as_view(), name='chat-room-detail'),
    path('rooms/<int:course_id>/messages/', ChatMessageList.as_view(), name='chat-message-list'),
]
