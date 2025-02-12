from django.urls import path
from .consumers import ChatConsumer, NotificationConsumer

websocket_urlpatterns = [
    path('ws/chat/<str:token>/', ChatConsumer.as_asgi()),
    path('ws/chat/notification/<str:token>/', NotificationConsumer.as_asgi()),
]