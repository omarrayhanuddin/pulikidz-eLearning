from __future__ import absolute_import, unicode_literals

from backend.celery import app
from django.core.mail import send_mail

from apps.base.utils import send_verification_email, send_password_reset_email

@app.task
def send_verification_mail_on_delay(email, token):
    send_verification_email(email, token)


@app.task
def send_password_reset_email_on_delay(email, uid, token):
    send_password_reset_email(email=email, uid=uid, token=token)


@app.task
def notify_teacher(student_name, course_name, teacher_email, teacher_name):
    subject = f"New Student in {course_name}"

    body = f"""
    Hi {teacher_name},

    {student_name} has just enrolled in your {course_name} course.

    Welcome them to the class!
    """
    send_mail(
        subject,
        body,
        'your_from_email@example.com',
        [teacher_email],
    )