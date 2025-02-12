from rest_framework import generics, permissions
from .models import CourseFeedback, StatusUpdate
from .serializers import CourseFeedbackSerializer, StatusUpdateSerializer
from .filters import CourseFeedbackFilter, StatusUpdateFilter

class CourseFeedbackListCreateView(generics.ListCreateAPIView):
    """
    API view to list all feedback for a course and allow a student to create new feedback.
    If a 'course' query parameter is provided, the list is filtered by that course.
    """

    serializer_class = CourseFeedbackSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = CourseFeedback.objects.all()
    filterset_class = CourseFeedbackFilter


class CourseFeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a specific feedback.
    Only the student who created the feedback can update or delete it.
    """

    queryset = CourseFeedback.objects.all()
    serializer_class = CourseFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]


class StatusUpdateListCreateView(generics.ListCreateAPIView):
    """
    API view to list and create status updates.
    This view lists only the status updates of the logged-in user.
    """
    queryset = StatusUpdate.objects.all()
    serializer_class = StatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_class = StatusUpdateFilter


class StatusUpdateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a specific status update.
    Only the owner of the status update can modify or delete it.
    """
    queryset = StatusUpdate.objects.all()
    serializer_class = StatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
