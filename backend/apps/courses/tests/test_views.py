from .test_setup import TestSetUp
from django.urls import reverse


class TestViews(TestSetUp):

    def test_user_can_create_course(self):
        user = self.create_user()
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        res = self.client.post(
            self.course_list_create_url, self.course_data, format="json"
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["title"], self.course_data["title"])
        self.assertEqual(res.data["description"], self.course_data["description"])

    def test_user_can_get_course_list(self):
        self.create_course()
        res = self.client.get(self.course_list_create_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["results"][0]["title"], self.course_data["title"])
        self.assertEqual(
            res.data["results"][0]["description"], self.course_data["description"]
        )

    def test_user_can_update_course(self):
        user, course = self.create_course()
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        self.course_data["title"] = "React Tutorial"
        del self.course_data["instructor"]
        res = self.client.put(self.course_detail_url, self.course_data, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["title"], self.course_data["title"])

    def test_user_can_create_module(self):
        user, course = self.create_course()
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        self.module_data["course"] = course.id
        res = self.client.post(
            self.module_list_create_url, self.module_data, format="json"
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["title"], self.module_data["title"])

    def test_user_can_get_module_list(self):
        user, course = self.create_course()
        self.create_module(course)
        res = self.client.get(self.module_list_create_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["results"][0]["title"], self.module_data["title"])

    def test_user_can_update_module(self):
        user, course = self.create_course()
        module = self.create_module(course)
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        self.module_data["title"] = "Updated Module Title"
        self.module_data["course"] = self.module_data["course"].id
        res = self.client.put(
            reverse("module-detail", kwargs={"pk": module.id}),
            self.module_data,
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["title"], self.module_data["title"])

    def test_user_can_create_module_content(self):
        user, course = self.create_course()
        module = self.create_module(course)
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        self.module_content_data["module"] = module.id
        res = self.client.post(
            self.module_content_list_create_url, self.module_content_data, format="json"
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(
            res.data["content_type"], self.module_content_data["content_type"]
        )
        self.assertEqual(res.data["text"], self.module_content_data["text"])

    def test_user_can_get_module_content_list(self):
        user, course = self.create_course()
        module = self.create_module(course)
        self.create_module_content(module)
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        res = self.client.get(self.module_content_list_create_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.data["results"][0]["content_type"],
            self.module_content_data["content_type"],
        )
        self.assertEqual(
            res.data["results"][0]["text"], self.module_content_data["text"]
        )

    def test_user_can_update_module_content(self):
        user, course = self.create_course()
        module = self.create_module(course)
        module_content = self.create_module_content(module)
        self.module_content_data["module"] = self.module_content_data["module"].id
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        self.module_content_data["text"] = "Updated Module Content Title"
        res = self.client.put(
            reverse("module-content-detail", kwargs={"pk": module_content.id}),
            self.module_content_data,
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["text"], self.module_content_data["text"])

    def test_user_can_enroll_in_course(self):
        user, course = self.create_course()
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        enroll_url = reverse("enroll-course", kwargs={"course_id": course.id})
        res = self.client.post(enroll_url, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.data["message"])

    def test_user_can_get_enrolled_students(self):
        user, course = self.create_course()
        access_token = self.get_token(user)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        enroll_url = reverse("enroll-course", kwargs={"course_id": course.id})
        self.client.post(enroll_url, format="json")
        enrolled_students_url = reverse("enrolled-student")
        res = self.client.get(enrolled_students_url, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.data["results"]) > 0)

    def test_user_can_block_unblock_student(self):
        user, course = self.create_course()
        student = self.create_user(True)
        access_token = self.get_token(user)
        student_access_token = self.get_token(student)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {student_access_token}"}
        self.client.credentials(**headers)

        enroll_url = reverse("enroll-course", kwargs={"course_id": course.id})
        enrollment_res = self.client.post(enroll_url, format="json")

        # Block the student
        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        block_url = reverse(
            "block-student", kwargs={"pk": enrollment_res.data["enrollment_id"]}
        )
        block_data = {"is_blocked": True}
        res = self.client.put(block_url, data=block_data, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data["is_blocked"])

        # Unblock the student
        unblock_data = {"is_blocked": False}
        res = self.client.patch(block_url, data=unblock_data, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.data["is_blocked"])

    def test_get_enrolled_student_by_course(self):
        user, course = self.create_course()
        student = self.create_user(True)
        access_token = self.get_token(user)
        student_access_token = self.get_token(student)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {student_access_token}"}
        self.client.credentials(**headers)

        enroll_url = reverse("enroll-course", kwargs={"course_id": course.id})
        enrollment_res = self.client.post(enroll_url, format="json")

        headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
        self.client.credentials(**headers)
        # Get enrolled students by course
        enrolled_students_url = reverse("enrolled-student")
        res = self.client.get(enrolled_students_url, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["results"]), 1)
        self.assertEqual(
            res.data["results"][0]["id"], enrollment_res.data["enrollment_id"]
        )
