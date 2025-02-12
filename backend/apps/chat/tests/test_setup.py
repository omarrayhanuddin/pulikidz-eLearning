from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from backend.custom_authentication import TokenManager
from apps.courses.models import *
from apps.courses.models import Course, CourseEnrollment
from apps.feedback.models import CourseFeedback

class TestSetUp(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(email='testemail1@example', password='testpassword')
        self.teacher = User.objects.create_user(email='testmail2@example', password='testpassword')
 
        course_data = {
            "title": "Introduction to Web Development",
            "description": "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
            "instructor":self.teacher
        }
        self.course = Course.objects.create(**course_data)
        self.course_feedback_data = {
            "course":self.course,
            'comment': 'This is a test feedback.',
            'rating': 5,
            "student":self.student,
            "id":1
        }
        self.course_feedback_url = reverse('feedback-list-create')
        self.course_feedback_detail_url = reverse('feedback-detail', kwargs={'pk': self.course_feedback_data['id']})

        return super().setUp()

    def tearDown(self):
        return super().tearDown()
    
    def enroll_student(self, student, course):
        return CourseEnrollment.objects.create(student=student, course=course)

    def create_course_feedbak(self):
        return CourseFeedback.objects.create(**self.course_feedback_data)


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
