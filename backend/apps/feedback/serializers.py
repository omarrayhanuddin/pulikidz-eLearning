from rest_framework import serializers
from .models import CourseFeedback, StatusUpdate
from apps.users.serializers import ProfileSerializer

class CourseFeedbackSerializer(serializers.ModelSerializer):
    # student is read-only: it will be set automatically from request.user.
    student = ProfileSerializer(read_only=True)

    class Meta:
        model = CourseFeedback
        fields = [
            "id",
            "course",
            "student",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        if not user.enrolled_courses.filter(course=validated_data["course"]).exists():
            raise serializers.ValidationError(
                "Only students can leave feedback on courses."
            )
        feedback =  user.course_feedbacks.filter(course=validated_data["course"])
        if feedback.exists():
            feedback.update(**validated_data)
            return feedback.first()
        validated_data["student"] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        if instance.student != user:
            raise serializers.ValidationError(
                "You don't have permissions to update other's feedback."
            )
        return super().update(instance, validated_data)


class StatusUpdateSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)

    class Meta:
        model = StatusUpdate
        fields = ["id", "user", "content", "created_at"]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        if instance.user != user:
            raise serializers.ValidationError(
                "You don't have permissions to update other's status."
            )
        return super().update(instance, validated_data)
