from django.db import models
from django.conf import settings
from apps.base.models import BaseModelWithoutID
from .managers import UserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from apps.base.utils import generate_random_number


# Create your models here.


def user_picture_upload(instance, filename):
    return f"{instance.email}/profile/{filename}"


class User(BaseModelWithoutID, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, blank=False, null=False)
    name = models.CharField(max_length=255)
    profile_pic = models.ImageField(
        upload_to=user_picture_upload,
        blank=True,
        null=True,
    )
    bio = models.TextField(blank=True, null=True)
    secret_key = models.CharField(
        max_length=11, blank=True, default=generate_random_number
    )
    # Only admin access fields
    is_deleted = models.BooleanField(default=False)
    is_deleted_on = models.DateTimeField(null=True, blank=True)
    verification_token = models.UUIDField(blank=True, null=True)
    is_staff = models.BooleanField(default=False)
    is_teacher = models.BooleanField(default=False)

    USERNAME_FIELD = "email"

    objects = UserManager()

    class Meta:
        db_table = f"{settings.DB_PREFIX}user"

    @property
    def is_admin(self):
        return self.is_superuser

    def __str__(self):
        return str(self.id)

    @property
    def is_email_verified(self):
        return False if self.verification_token else True
