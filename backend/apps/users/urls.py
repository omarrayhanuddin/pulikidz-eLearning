from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.UserRegistrationView.as_view(), name="register"),
    path("login/", views.UserLoginView.as_view(), name="login"),
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="change_password",
    ),
    path(
        "send-password-reset/",
        views.send_password_reset_email,
        name="send-password-reset-email",
    ),
    path(
        "verify-email/<str:token>/",
        views.email_verification_done,
        name="verify-email",
    ),
    path("reset-password/", views.PasswordResetView.as_view(), name="reset-password"),
    path("profile/", views.ProfileUpdateView.as_view(), name="profile-update"),
    path("users/", views.UserListView.as_view(), name="users")
]
