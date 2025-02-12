from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from backend.custom_authentication import TokenManager
from apps.courses.models import *


class TestSetUp(APITestCase):
    def setUp(self):
        self.course_data = {
            "title": "Introduction to Web Development",
            "description": "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
        }
        self.course_list_create_url = reverse("course-list-create")
        self.course_detail_url = reverse("course-detail", kwargs={"pk": 1})
        self.user_data = {
            "name": "John Doe",
            "email": "johndoe@example.com",
            "password": "SecurePass123",
        }
        self.user_data2 = {
            "name": "Mark",
            "email": "mark@example.com",
            "password": "SecurePass123",
        }
        self.module_data = {
            "title": "HTML Basics",
        }
        self.module_list_create_url = reverse("module-list-create")
        self.module_detail_url = reverse("module-detail", kwargs={"pk": 1})
        self.module_content_data = {
            "content_type": "text",
            "text": "<p>Learn about HTML tags.</p>",
        }
        self.module_content_list_create_url = reverse("module-content-list-create")
        self.module_content_detail_url = reverse(
            "module-content-detail", kwargs={"pk": 1}
        )
        return super().setUp()

    def tearDown(self):
        return super().tearDown()

    def create_user(self, second=False):
        if second:
            user = get_user_model().objects.create(**self.user_data2)
        else:
            user = get_user_model().objects.create(**self.user_data)
        user.set_password(self.user_data.get("password"))
        user.save()
        return user

    def get_token(self, user):
        payload = {"user_id": user.id, "secret_key": user.secret_key}
        return TokenManager.get_token(payload)

    def create_course(self):
        user = self.create_user()
        self.course_data["instructor"] = user
        course = Course.objects.create(**self.course_data)
        return user, course

    def create_module(self, course):
        self.module_data["course"] = course
        module = Module.objects.create(**self.module_data)
        return module

    def create_module_content(self, module):
        self.module_content_data["module"] = module
        module_content = ModuleContent.objects.create(**self.module_content_data)
        return module_content
