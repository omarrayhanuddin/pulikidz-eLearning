from .test_setup import TestSetUp


class TestViews(TestSetUp):
    def test_user_can_register(self):
        res = self.client.post(
            self.register_url, self.user_register_data, format="json"
        )
        self.assertEqual(res.status_code, 201)

    def test_user_can_login(self):
        self.create_user()
        res = self.client.post(self.login_url, self.login_data, format="json")
        self.assertEqual(res.status_code, 200)

    def test_user_can_get_profile(self):
        access_token = self.get_token(self.create_user())
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        res = self.client.get(self.profile_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["name"], self.user_data["name"])
        self.assertEqual(res.data["email"], self.user_data["email"])

    def test_user_can_update_profile(self):
        user = self.create_user()
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        updated_data = {"name": "Jack", "email": user.email}
        res = self.client.put(self.profile_url, updated_data, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["name"], updated_data["name"])
        self.assertEqual(res.data["email"], updated_data["email"])

    def test_user_can_change_password(self):
        user = self.create_user()
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        data = {
            "old_password": self.user_data["password"],
            "new_password": "NewSecurePass432",
            "confirm_new_password": "NewSecurePass432",
        }
        res = self.client.post(self.change_password_url, data, format="json")
        self.assertEqual(res.status_code, 200)

    def test_get_users_without_login(self):
        user = self.create_user()
        res = self.client.get(self.users_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["results"][0]["email"], user.email)
