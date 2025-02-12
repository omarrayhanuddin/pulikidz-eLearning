from django.db import models
from django.contrib.auth import get_user_model
from apps.base.models import BaseModelWithoutID

User = get_user_model()


class Course(BaseModelWithoutID):
    """A course that contains multiple modules."""
    banner = models.ImageField(upload_to="banner", null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="courses_created"
    )

    def __str__(self):
        return self.title


class CourseEnrollment(BaseModelWithoutID):
    """Tracks which students are enrolled in which courses."""

    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="enrolled_courses"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )
    is_blocked = models.BooleanField(default=False)
    class Meta:
        unique_together = ("student", "course")


class Module(BaseModelWithoutID):
    """A module within a course that contains different content types."""

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class ModuleContent(BaseModelWithoutID):
    """A generic model that handles different types of content for modules."""

    class ContentType(models.TextChoices):
        TEXT = "text", "Text"
        FILE = "file", "File"
        VIDEO = "video", "Video"
        IMAGE = "image", "Image"

    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="contents"
    )
    content_type = models.CharField(max_length=10, choices=ContentType.choices)
    text = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="module_files/", blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to="module_images/", blank=True, null=True)
    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.module.title} - {self.content_type}"
