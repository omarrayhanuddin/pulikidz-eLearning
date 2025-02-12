import django_filters
from .models import User


class UserFilter(django_filters.FilterSet):
    course_student = django_filters.CharFilter(
        field_name="enrolled_courses__course",
        lookup_expr="exact"
    )
    class Meta:
        model = User
        fields = ["id", "is_teacher", "name", "email"]