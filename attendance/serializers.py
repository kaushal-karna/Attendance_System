from rest_framework import serializers

from .models import Attendance, Department, Employee


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            "id",
            "name",
            "description",
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "uid",
            "name",
            "department",
            "department_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "department_name",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    uid = serializers.CharField(
        source="employee.uid",
        read_only=True,
    )

    employee_name = serializers.CharField(
        source="employee.name",
        read_only=True,
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "uid",
            "employee_name",
            "employee",
            "date",
            "check_in",
            "check_out",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "uid",
            "employee_name",
            "created_at",
            "updated_at",
        ]
        
        
class UIDAttendanceSerializer(serializers.Serializer):
    uid = serializers.CharField(
        max_length=50,
        trim_whitespace=True,
        help_text="Unique employee UID, for example EMP001.",
    )