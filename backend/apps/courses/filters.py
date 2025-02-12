import django_filters
from .models import Course, Module, CourseEnrollment
from django.db.models import Q

class CourseEnrollmentFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="search_filter")

    class Meta:
        model = CourseEnrollment
        fields = ["id", "course__id", "student__id", "is_blocked"]

    def search_filter(self, qs, name, value):
        print("working")
        return qs.filter(
            Q(student__email__icontains=value)|
            Q(student__name__icontains=value)
        )


class CourseFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="search_filter")
    student = django_filters.CharFilter(field_name="enrollments__student", lookup_expr="exact")
    teacher = django_filters.CharFilter(field_name="instructor__id", lookup_expr="iexact")
    class Meta:
        model = Course
        fields = ["id", "title", "instructor"]

    def search_filter(self, qs, name, value):
        keywords = [keyword.lower() for keyword in value.split()]
        filtered_queryset = qs
        searched_qs = qs.none()
        for keyword in keywords:
            searched_qs |= filtered_queryset.filter(
                Q(title__icontains=keyword) | Q(description__icontains=keyword)
            )
        return searched_qs.order_by("title", "description")


class ModuleFilter(django_filters.FilterSet):
    class Meta:
        model = Module
        fields = ["id", "course"]
