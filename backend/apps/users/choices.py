from django.db import models


class UserTypeChoices(models.TextChoices):
    TEACHER = 'teacher'
    STUDENT = 'student'
    ADMIN = 'admin'