from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import ValidationError
from .models import Course, Module, ModuleContent, CourseEnrollment
from .serializers import (
    CourseSerializer,
    ModuleSerializer,
    ModuleContentSerializer,
    CourseEnrollmentSerializer,
)
from rest_framework import serializers
from .filters import CourseFilter, ModuleFilter, CourseEnrollmentFilter
from .tasks import notify_teacher


class CourseListCreateView(generics.ListCreateAPIView):
    """Handles listing all courses & creating a new course"""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_class = CourseFilter
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Handles retrieving, updating, and deleting a course"""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ModuleListCreateView(generics.ListCreateAPIView):
    """Handles adding modules to a course"""

    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_class = ModuleFilter


class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Handles updating or deleting a module"""

    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ModuleContentListCreateView(generics.ListCreateAPIView):
    """Handles adding content to a module"""

    queryset = ModuleContent.objects.all()
    serializer_class = ModuleContentSerializer
    permission_classes = [permissions.IsAuthenticated]


class ModuleContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Handles updating or deleting a module content"""

    queryset = ModuleContent.objects.all()
    serializer_class = ModuleContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EnrollInCourseView(APIView):
    """Handles student enrollments"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        course_id = kwargs.get("course_id")
        course = Course.objects.filter(id=course_id).first()

        if not course:
            raise ValidationError({"course_id": "Course not found."})

        # Check if already enrolled
        if CourseEnrollment.objects.filter(
            student=request.user, course=course
        ).exists():
            raise ValidationError(
                {"message": "You are already enrolled in this course."}
            )

        # Enroll student
        enrollment = CourseEnrollment.objects.create(
            student=request.user, course=course
        )
        notify_teacher.delay(
            student_name=request.user.name, 
            course_name=course.title, 
            teacher_email=course.instructor.email,
            teacher_name=course.instructor.name
        )
        return Response(
            {"message": "Enrolled successfully!", "enrollment_id": enrollment.id},
            status=status.HTTP_201_CREATED,
        )

class EnrolledStudentView(generics.ListAPIView):
    queryset = CourseEnrollment.objects.all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = CourseEnrollmentFilter

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(course__instructor=self.request.user)
    

class BlockEnrolledStudentView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseEnrollment.objects.all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.course.instructor != self.request.user:
            raise serializers.ValidationError(
                {"message": "You don't have permissions to perform this action."}
            )
        return obj


