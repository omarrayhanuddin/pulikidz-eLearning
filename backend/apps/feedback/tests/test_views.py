from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from apps.feedback.models import CourseFeedback, StatusUpdate
from .test_setup import TestSetUp
from django.contrib.auth import get_user_model
User = get_user_model()


class CourseFeedbackTests(TestSetUp):

    def test_course_feedback_list(self):
        CourseFeedback.objects.create(**self.course_feedback_data)

        response = self.client.get(self.course_feedback_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['comment'], self.course_feedback_data['comment'])

    def test_course_feedback_create(self):
        self.enroll_student(self.student, self.course)
        new_feedback_data = {
            'course': self.course.id,
            'comment': 'New feedback text',
            'rating': 4,
            'student': self.student.id,
        }
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.course_feedback_url, new_feedback_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CourseFeedback.objects.count(), 1)


    def test_course_feedback_detail(self):
        self.enroll_student(self.student, self.course)
        self.create_course_feedbak()
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.course_feedback_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['comment'], self.course_feedback_data['comment'])

    def test_course_feedback_update(self):
        self.enroll_student(self.student, self.course)
        feedback = self.create_course_feedbak()
        self.client.force_authenticate(user=self.student)
        updated_data = {'comment': 'Updated feedback text', "course":self.course.id}
        response = self.client.put(self.course_feedback_detail_url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        feedback.refresh_from_db()
        self.assertEqual(feedback.comment, updated_data['comment'])

    def test_course_feedback_delete(self):
        self.enroll_student(self.student, self.course)
        self.create_course_feedbak()
        self.client.force_authenticate(user=self.student)
        response = self.client.delete(self.course_feedback_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CourseFeedback.objects.count(), 0)



class StatusUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example', password='testpassword')
        self.client.force_authenticate(user=self.user)
        self.status_update_data = {'content': 'Test status update'}
        self.status_update = StatusUpdate.objects.create(user=self.user, content=self.status_update_data['content'])
        self.status_update_url = reverse('status-update-list-create')
        self.status_update_detail_url = reverse('status-update-detail', kwargs={'pk': self.status_update.pk})

    def test_status_update_list(self):
        response = self.client.get(self.status_update_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['content'], self.status_update_data['content'])

    def test_status_update_create(self):
        new_status_data = {'content': 'New status update'}
        response = self.client.post(self.status_update_url, new_status_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StatusUpdate.objects.count(), 2)
        self.assertEqual(response.data['user']['id'], self.user.id)
        self.assertEqual(response.data['content'], new_status_data['content'])


    def test_status_update_detail(self):
        response = self.client.get(self.status_update_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], self.status_update_data['content'])

    def test_status_update_update(self):
        updated_data = {'content': 'Updated status text'}
        response = self.client.put(self.status_update_detail_url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.status_update.refresh_from_db()
        self.assertEqual(self.status_update.content, updated_data['content'])

    def test_status_update_delete(self):
        response = self.client.delete(self.status_update_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(StatusUpdate.objects.count(), 0)