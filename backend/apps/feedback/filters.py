import django_filters
from .models import CourseFeedback, StatusUpdate


class CourseFeedbackFilter(django_filters.FilterSet):
    course = django_filters.CharFilter(
        field_name="course__id", lookup_expr="iexact"
    )

    class Meta:
        model = CourseFeedback
        fields = ["course"]


class StatusUpdateFilter(django_filters.FilterSet):
    user = django_filters.CharFilter(field_name="user_id", lookup_expr="exact")

    class Meta:
        model = StatusUpdate
        fields = ["user"]
