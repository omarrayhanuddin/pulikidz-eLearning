from rest_framework import serializers
from .models import Course, Module, ModuleContent, CourseEnrollment
from apps.users.serializers import ProfileSerializer
from django.db.models import Avg


class CourseSerializer(serializers.ModelSerializer):
    """Handles Course creation & retrieval"""

    instructor = ProfileSerializer(read_only=True)
    has_enrolled = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()


    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "instructor",
            "created_at",
            "banner",
            "has_enrolled",
            "rating",
            "is_blocked",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["instructor"] = user
        if not user.is_teacher:
            user.is_teacher = True
            user.save()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        print("here")
        user = self.context["request"].user
        if instance.instructor != user:
            raise serializers.ValidationError(
                "You don't have permissions to update other's course."
            )
        return super().update(instance, validated_data)

    def get_has_enrolled(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        if user == obj.instructor or user.enrolled_courses.filter(course=obj).exists():
            return True
        return False
    
    def get_rating(self, obj):
        avg_rating = obj.feedbacks.aggregate(
            Avg("rating")
        )["rating__avg"]
        return avg_rating if avg_rating else 1
    
    def get_is_blocked(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return True
        return obj.enrollments.filter(student=user, is_blocked=True).exists()



class ModuleSerializer(serializers.ModelSerializer):
    """Handles Modules inside Courses"""

    module_contents = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "title", "course", "order", "module_contents"]

    def get_module_contents(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return []
        if not (
            obj.course.instructor == user
            or user.enrolled_courses.filter(course=obj.course).exists()
        ):
            return []
        return ModuleContentSerializer(
            obj.contents.all(), many=True, context=self.context
        ).data

    def create(self, validated_data):
        user = self.context["request"].user
        course = validated_data["course"]
        if course.instructor != user:
            raise serializers.ValidationError(
                {
                    "message": "You do not have permissions to add modules to this course."
                }
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        if instance.course.instructor != user:
            raise serializers.ValidationError(
                {
                    "message": "You do not have permissions to update modules of this course."
                }
            )
        validated_data.pop("course")
        return super().update(instance, validated_data)


class ModuleContentSerializer(serializers.ModelSerializer):
    """Handles different content types inside a Module"""

    class Meta:
        model = ModuleContent
        fields = [
            "id",
            "module",
            "content_type",
            "text",
            "file",
            "video_url",
            "image",
            "order",
        ]

    def validate(self, data):
        """Ensure only the correct content type has a value"""
        content_fields = ["text", "file", "video_url", "image"]
        selected_field = None

        for field in content_fields:
            if data.get(field):
                if selected_field:
                    raise serializers.ValidationError(
                        "Only one content type can be selected per module content."
                    )
                selected_field = field

        if not selected_field:
            raise serializers.ValidationError(
                "You must provide at least one content type."
            )

        return data

    def create(self, validated_data):
        user = self.context["request"].user
        module = validated_data["module"]
        if module.course.instructor != user:
            raise serializers.ValidationError(
                {"message": "You do not have permission to add content to this module."}
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        if instance.module.course.instructor != user:
            raise serializers.ValidationError(
                {
                    "message": "You do not have permission to update content of this module."
                }
            )
        validated_data.pop("module")
        return super().update(instance, validated_data)


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Handles student enrollments in a course"""

    student = ProfileSerializer(read_only=True)

    class Meta:
        model = CourseEnrollment
        fields = ["id", "student", "course", "created_at", "is_blocked"]
        read_only_fields = ["id", "course", "created_at"]
