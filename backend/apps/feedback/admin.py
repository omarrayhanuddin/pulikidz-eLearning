from django.contrib import admin
from .models import CourseFeedback, StatusUpdate

@admin.register(CourseFeedback)
class CourseFeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'course', 'student', 'rating', 'created_at')
    list_filter = ('course', 'rating', 'created_at')
    search_fields = ('course__title', 'student__email', 'comment')

@admin.register(StatusUpdate)
class StatusUpdateAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'content')
