from django.contrib import admin
from .models import Course, CourseEnrollment, Module, ModuleContent


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "instructor", "id")
    search_fields = ("title", "instructor__email")
    list_filter = ("instructor",)
    raw_id_fields = ("instructor",)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "id")
    search_fields = ("student__email", "course__title")
    list_filter = ("course",)
    raw_id_fields = ("student", "course")


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order", "id")
    search_fields = ("title", "course__title")
    list_filter = ("course",)
    ordering = ("course", "order")


@admin.register(ModuleContent)
class ModuleContentAdmin(admin.ModelAdmin):
    list_display = ("module", "content_type", "order", "id")
    search_fields = ("module__title", "content_type")
    list_filter = ("content_type",)
    ordering = ("module", "order")