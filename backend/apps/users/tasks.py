from __future__ import absolute_import, unicode_literals

from backend.celery import app
from apps.base.utils import send_verification_email, send_password_reset_email

@app.task
def send_verification_mail_on_delay(email, token):
    send_verification_email(email, token)


@app.task
def send_password_reset_email_on_delay(email, uid, token):
    send_password_reset_email(email=email, uid=uid, token=token)