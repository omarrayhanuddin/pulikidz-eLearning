from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from ..models import ChatRoom, ChatMessage
from apps.courses.models import Course
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', password='testpassword')
        self.client.force_authenticate(user=self.user)

        self.course = Course.objects.create(title="Test Course", instructor=self.user)  # Create a course
        self.chat_room = ChatRoom.objects.create(course=self.course)

        self.chat_room_url = reverse('chat-room-detail', kwargs={'course_id': self.course.id})
        self.chat_message_list_url = reverse('chat-message-list', kwargs={'course_id': self.course.id})

    def test_chat_room_detail(self):
        response = self.client.get(self.chat_room_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['course'], self.course.id)

    def test_chat_message_list_empty(self):
        response = self.client.get(self.chat_message_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_chat_message_list_with_messages(self):
        ChatMessage.objects.create(room=self.chat_room, sender=self.user, message="Hello!")
        ChatMessage.objects.create(room=self.chat_room, sender=self.user, message="World!")

        response = self.client.get(self.chat_message_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        self.assertEqual(response.data['results'][0]['message'], "Hello!")
        self.assertEqual(response.data['results'][1]['message'], "World!")
        self.assertEqual(response.data['results'][0]['sender']['id'], self.user.id)

    def test_chat_room_detail_unauthenticated(self):
      self.client.force_authenticate(user=None)

      response = self.client.get(self.chat_room_url)
      self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_chat_message_list_unauthenticated(self):
      self.client.force_authenticate(user=None)

      response = self.client.get(self.chat_message_list_url)
      self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)