import uuid
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from backend.custom_authentication import TokenManager
from apps.base.utils import generate_random_number
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from apps.feedback.models import CourseFeedback
from django.db.models import Avg

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    confirm_password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "password",
            "confirm_password",
        ]

    def validate(self, attrs):
        # Validate password match
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        # Remove confirm_password since it's not needed in the database
        validated_data.pop("confirm_password")

        # Create user and hash password
        user = User.objects.create(**validated_data)
        user.set_password(validated_data["password"])

        # Generate verification token
        user.verification_token = uuid.uuid4()
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]
        user = User.objects.filter(email=email).first()

        if user is None:
            raise serializers.ValidationError({"message": "Email does not exist."})

        # if not user.is_email_verified:
        #     raise serializers.ValidationError({"message": "Account not verified."})

        if not user.is_active:
            raise serializers.ValidationError({"message": "Account is inactive."})

        # Authenticate user
        user = authenticate(email=email, password=password)
        if user is None:
            raise serializers.ValidationError({"message": "Incorrect password."})

        # Update last active timestamp
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        # Generate access token
        payload = {
            "user_id": str(user.id),
            "secret_key": user.secret_key,
        }
        access_token = TokenManager.get_access(payload)

        return {"message": "Login successful.", "access_token": access_token}


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user

        old_password = attrs["old_password"]
        new_password = attrs["new_password"]
        confirm_password = attrs["confirm_new_password"]

        # Validate old password
        if not user.check_password(old_password):
            raise serializers.ValidationError({"old_password": "Invalid old password."})

        # Ensure new password and confirm_password match
        if new_password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_new_password": "Passwords do not match."}
            )

        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        # chaning the secret key upon changing the password for extra security.
        user.secret_key = generate_random_number()
        user.save()
        payload = {
            "user_id": str(user.id),
            "secret_key": user.secret_key,
        }
        access_token = TokenManager.get_access(payload)
        return {
            "message": "Password changed successfully.",
            "access_token": access_token,
        }


class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        token = attrs.get("token")
        uid = attrs.get("uid")
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        # Decode UID and get user
        try:
            user_id = smart_str(urlsafe_base64_decode(uid))
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, DjangoUnicodeDecodeError):
            raise serializers.ValidationError({"uid": "Invalid or expired UID."})

        # Validate reset token
        if not PasswordResetTokenGenerator().check_token(user, token):
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        # Validate password strength
        try:
            validate_password(password)
        except serializers.ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        # Ensure passwords match
        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        new_password = self.validated_data["password"]

        # Set new password
        user.set_password(new_password)

        # Update secret_key (for security reasons)
        user.secret_key = generate_random_number()
        user.save()
        return {"message": "Password Reset Successful"}


class ProfileSerializer(serializers.ModelSerializer):
    total_course = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "profile_pic", "email", "bio", "total_course", "avg_rating"]
        extra_kwargs = {"email": {"read_only": True}}

    def get_total_course(self, obj):
        return obj.courses_created.count()

    def get_avg_rating(self, obj):
        avg_rating = CourseFeedback.objects.filter(course__instructor_id=obj.id).aggregate(
            Avg("rating")
        )["rating__avg"]
        return avg_rating if avg_rating else 1
