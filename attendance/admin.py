from django.contrib import admin

from .models import Attendance, Department, Employee


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "uid",
        "name",
        "department",
        "is_active",
        "created_at",
    )
    list_filter = ("department", "is_active")
    search_fields = ("uid", "name")
    ordering = ("uid",)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "date",
        "check_in",
        "check_out",
    )
    list_filter = ("date",)
    search_fields = (
        "employee__uid",
        "employee__name",
    )
    ordering = ("-date", "-check_in")