from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework.exceptions import NotFound


def send_verification_email(email, token):
    subject = "Verify your email address"
    message = f"Please click the following link to verify your email address: {settings.SITE_URL}/api/user/verify-email/{str(token)}"
    # from_email = 'noreply@example.com'
    recipient_list = [email]
    send_mail(
        subject=subject, message=message, from_email=None, recipient_list=recipient_list
    )


def send_password_reset_email(email, uid, token):
    subject = "Reset Your Password"
    message = f"Click on the following link to reset your password: {settings.SITE_URL}/password-reset/?uid={uid}&token={token}"
    # from_email = 'noreply@example.com'
    recipient_list = [email]
    send_mail(
        subject=subject, message=message, from_email=None, recipient_list=recipient_list
    )


def get_object_by_id(model, object_id):
    try:
        obj = model.objects.get(id=object_id)
        return obj
    except model.DoesNotExist:
        raise NotFound(
            detail={
                "errors": {
                    "id": f"No instance of {model.__name__} was found for ID '{object_id}'"
                },
                "code": "not_found",
            }
        )


def get_object_by_kwargs(model, kwargs: dict):
    try:
        obj = model.objects.get(**kwargs)
        return obj
    except model.DoesNotExist:
        raise NotFound(
            detail={
                "errors": {
                    field: f"No instance of {model.__name__} was found for '{value}'"
                    for field, value in kwargs.items()
                },
                "code": "not_found",
            }
        )


def generate_random_number():
    return str(random.randint(1000000000, 9999999999))
