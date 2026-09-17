from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    extend_schema,
)

from .models import Attendance, Department, Employee
from .serializers import (
    AttendanceSerializer,
    DepartmentSerializer,
    EmployeeSerializer,
    UIDAttendanceSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("department").all()
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        request=UIDAttendanceSerializer,
        responses={
            200: OpenApiResponse(
                description="Check-in successful."
            ),
            400: OpenApiResponse(
                description="Employee has already checked in today."
            ),
            404: OpenApiResponse(
                description="Employee not found or inactive."
            ),
        },
        summary="Employee Check-in",
        description=(
            "Check an employee into the office using their UID. "
            "The server automatically determines the current date "
            "and time."
        ),
        examples=[
            OpenApiExample(
                "Check-in",
                value={
                    "uid": "EMP001"
                },
                request_only=True,
            ),
        ],
        tags=["Attendance"],
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="check-in",
    )
    def check_in(self, request):
        serializer = UIDAttendanceSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        uid = serializer.validated_data["uid"]

        try:
            employee = Employee.objects.get(
                uid=uid,
                is_active=True,
            )
        except Employee.DoesNotExist:
            return Response(
                {
                    "error": "Employee not found or inactive.",
                    "uid": uid,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.localtime()
        today = now.date()
        current_time = now.time()

        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
        )

        if not created and attendance.check_in is not None:
            return Response(
                {
                    "error": "Employee has already checked in today.",
                    "uid": employee.uid,
                    "employee_name": employee.name,
                    "date": attendance.date,
                    "check_in": attendance.check_in,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance.check_in = current_time
        attendance.save(
            update_fields=[
                "check_in",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Check-in successful.",
                "uid": employee.uid,
                "employee_name": employee.name,
                "department": employee.department.name,
                "date": attendance.date,
                "check_in": attendance.check_in,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        request=UIDAttendanceSerializer,
        responses={
            200: OpenApiResponse(
                description="Check-out successful."
            ),
            400: OpenApiResponse(
                description=(
                    "Employee has not checked in or has "
                    "already checked out."
                )
            ),
            404: OpenApiResponse(
                description=(
                    "Employee or today's attendance "
                    "record was not found."
                )
            ),
        },
        summary="Employee Check-out",
        description=(
            "Check an employee out using their UID. "
            "The employee must have checked in today. "
            "The server automatically records the current time."
        ),
        examples=[
            OpenApiExample(
                "Check-out",
                value={
                    "uid": "EMP001"
                },
                request_only=True,
            ),
        ],
        tags=["Attendance"],
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="check-out",
    )
    def check_out(self, request):
        serializer = UIDAttendanceSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        uid = serializer.validated_data["uid"]

        try:
            employee = Employee.objects.get(
                uid=uid,
                is_active=True,
            )
        except Employee.DoesNotExist:
            return Response(
                {
                    "error": "Employee not found or inactive.",
                    "uid": uid,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.localtime()
        today = now.date()
        current_time = now.time()

        try:
            attendance = Attendance.objects.get(
                employee=employee,
                date=today,
            )
        except Attendance.DoesNotExist:
            return Response(
                {
                    "error": "Employee has not checked in today.",
                    "uid": employee.uid,
                    "date": today,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if attendance.check_in is None:
            return Response(
                {
                    "error": "Employee has not checked in today.",
                    "uid": employee.uid,
                    "date": today,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if attendance.check_out is not None:
            return Response(
                {
                    "error": "Employee has already checked out today.",
                    "uid": employee.uid,
                    "employee_name": employee.name,
                    "date": attendance.date,
                    "check_out": attendance.check_out,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance.check_out = current_time
        attendance.save(
            update_fields=[
                "check_out",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Check-out successful.",
                "uid": employee.uid,
                "employee_name": employee.name,
                "department": employee.department.name,
                "date": attendance.date,
                "check_in": attendance.check_in,
                "check_out": attendance.check_out,
            },
            status=status.HTTP_200_OK,
        )