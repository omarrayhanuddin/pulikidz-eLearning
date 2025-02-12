from django.contrib import admin
from .models import ChatRoom, ChatMessage

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'course', 'created_at')
    search_fields = ('course__title',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender', 'message', 'timestamp')
    search_fields = ('room__course__title', 'sender__email', 'message')
    ordering = ('-timestamp',)
