import jwt
from django.conf import settings
from django.utils import timezone
from rest_framework import authentication, exceptions
from apps.users.models import User


class TokenManager:
    """TokenManager will generate, decode, and validate JWT tokens"""

    @staticmethod
    def get_token(payload: dict, token_type: str ="access") -> str:
        """Generate a JWT token with the given payload and token type."""
        encoded: str = jwt.encode(
            {
                "type": token_type,
                **payload
            },
            settings.SECRET_KEY,
            algorithm="HS256"
        )
        return encoded if isinstance(encoded, str) else encoded.decode()

    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode a JWT token and return the payload."""
        try:
            decoded: dict = jwt.decode(
                token,
                key=settings.SECRET_KEY,
                algorithms="HS256"
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")
        return decoded

    @staticmethod
    def get_access(payload: dict) -> str:
        """Generate an access token."""
        return TokenManager.get_token(payload)


class CustomAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for DRF.
    """

    def authenticate(self, request):
        """
        This method is used by Django REST Framework to authenticate users.
        """
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split("Bearer ")[-1]

        decoded_data = TokenManager.decode_token(token)
        if not decoded_data:
            return None

        return self.authenticate_credentials(decoded_data)

    def authenticate_credentials(self, decoded_data):
        """
        Validate the decoded token payload and return the authenticated user.
        """
        user_id = decoded_data.get("user_id")
        secret_key = decoded_data.get("secret_key")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed("User not found")

        if user.secret_key != secret_key:
            raise exceptions.AuthenticationFailed("Invalid credentials")

        user.last_active_on = timezone.now()
        user.save()
        

        return (user, None)

    def authenticate_header(self, request):
        """
        Specifies the authentication scheme used (used for DRF browsable API).
        """
        return "Bearer"
