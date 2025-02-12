from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from backend.custom_authentication import TokenManager


class TestSetUp(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.profile_url = reverse("profile-update")
        self.change_password_url = reverse("change_password")
        self.users_url =reverse("users")
        self.user_data = {
            "name": "John Doe",
            "email": "johndoe@example.com",
            "password": "SecurePass123",
        }
        self.user_register_data = {
            **self.user_data,
            "confirm_password":self.user_data.get("password")
        }
        self.login_data = {"email": "johndoe@example.com", "password": "SecurePass123"}
        return super().setUp()

    def tearDown(self):
        return super().tearDown()
    
    def create_user(self):
        user = get_user_model().objects.create(**self.user_data)
        user.set_password(self.user_data.get("password"))
        user.save()
        return user
    
    def get_token(self, user):
        payload ={
            "user_id":user.id,
            "secret_key":user.secret_key
        }
        return TokenManager.get_token(payload)