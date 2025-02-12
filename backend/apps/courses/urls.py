from django.urls import path
from .views import (
    CourseListCreateView,
    CourseDetailView,
    ModuleListCreateView,
    ModuleDetailView,
    ModuleContentListCreateView,
    ModuleContentDetailView,
    EnrollInCourseView,
    EnrolledStudentView,
    BlockEnrolledStudentView
)

urlpatterns = [
    # Course URLs
    path("courses/", CourseListCreateView.as_view(), name="course-list-create"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    # Module URLs
    path("modules/", ModuleListCreateView.as_view(), name="module-list-create"),
    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="module-detail"),
    # Module Content URLs
    path(
        "module-contents/",
        ModuleContentListCreateView.as_view(),
        name="module-content-list-create",
    ),
    path(
        "module-contents/<int:pk>/",
        ModuleContentDetailView.as_view(),
        name="module-content-detail",
    ),
    # Enrollment URL
    path(
        "courses/<int:course_id>/enroll/",
        EnrollInCourseView.as_view(),
        name="enroll-course",
    ),
    path("enrolled-students/", EnrolledStudentView.as_view(), name="enrolled-student"),
    path('block-unblock-student/<int:pk>/', BlockEnrolledStudentView.as_view(), name="block-student")
]
