from django.urls import path
from .views import (
    CourseFeedbackListCreateView,
    CourseFeedbackDetailView,
    StatusUpdateListCreateView,
    StatusUpdateDetailView,
)

urlpatterns = [
    path('feedbacks/', CourseFeedbackListCreateView.as_view(), name='feedback-list-create'),
    path('feedbacks/<int:pk>/', CourseFeedbackDetailView.as_view(), name='feedback-detail'),
    path('status-updates/', StatusUpdateListCreateView.as_view(), name='status-update-list-create'),
    path('status-updates/<int:pk>/', StatusUpdateDetailView.as_view(), name='status-update-detail'),
]
