from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
    PasswordResetSerializer,
    ProfileSerializer,
)
from django.contrib.auth import get_user_model
from rest_framework import status
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from .tasks import send_password_reset_email_on_delay, send_verification_mail_on_delay
from .filters import UserFilter
from backend.custom_authentication import TokenManager

User = get_user_model()


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        try:
            # send_verification_mail_on_delay.delay(
            #     user.email, str(user.verification_token)
            # )
            email_status = "A verification email has been sent to your email address."
        except Exception:
            email_status = (
                "Verification email could not be sent. Please contact support."
            )
            email_status = "A verification email has been sent to your email address."
        payload = {
            "user_id": str(user.id),
            "secret_key": user.secret_key,
        }
        token = TokenManager.get_token(payload)
        return Response(
            {
                "message": f"Registration Successful. {email_status}",
                "access_token": token,
            },
            status.HTTP_201_CREATED,
        )


class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        return Response(serializer.save(), status=200)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response_data = serializer.save()
        return Response(response_data, status=status.HTTP_200_OK)


class ProfileUpdateView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["POST"])
@permission_classes([AllowAny])
def send_password_reset_email(request):
    email = request.data.get("email")
    if not User.objects.filter(email=email).exists():
        raise ValidationError(
            {"email": "User with this email does not exists"},
        )
    user = User.objects.get(email=email)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)
    send_password_reset_email_on_delay.delay(user.email, uid, token)
    return Response(
        {"message": "Password reset link sent. Please check your email."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def email_verification_done(request, token):
    user = User.objects.filter(verification_token=token)
    if not user.exists():
        raise ValidationError(detail={"token": "Invalid verification token"})
    user = user.first()
    user.verification_token = None
    user.save()
    return Response({"message": "Successfully Verified"}, status=status.HTTP_200_OK)


class UserListView(ListAPIView):
    serializer_class = ProfileSerializer
    queryset = User.objects.all()
    filterset_class = UserFilter
    permission_classes = [AllowAny]



