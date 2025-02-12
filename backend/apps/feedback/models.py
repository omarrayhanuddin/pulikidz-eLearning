from django.db import models
from django.contrib.auth import get_user_model
from apps.base.models import BaseModelWithoutID

User = get_user_model()


class CourseFeedback(BaseModelWithoutID):
    """
    Model for storing feedback on courses.
    Only students should be allowed to leave feedback for a course.
    """

    course = models.ForeignKey(
        "courses.Course", on_delete=models.CASCADE, related_name="feedbacks"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="course_feedbacks"
    )
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField()

    def __str__(self):
        return f"Feedback on '{self.course.title}' by {self.student.email}"


class StatusUpdate(BaseModelWithoutID):
    """
    Model for storing status updates posted by a user (e.g. a student) on their home page.
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="status_updates"
    )
    content = models.TextField(help_text="Content of the status update")

    def __str__(self):
        return (
            f"Status update by {self.user.email} at {self.created_at:%Y-%m-%d %H:%M:%S}"
        )
