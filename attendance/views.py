import csv
from calendar import monthrange
from datetime import date, datetime
from io import BytesIO

from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from datetime import datetime, date, timedelta

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
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
    queryset = Attendance.objects.select_related(
        "employee",
        "employee__department"
        ).all()
    
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset= super().get_queryset()
    
        date = self.request.query_params.get("date")

        if date:
            queryset = queryset.filter(date=date)
            
        return queryset
    
    
    # Export to excel/csv schema

    @extend_schema(
    parameters=[
        OpenApiParameter(
            name="month",
            type=str,
            location=OpenApiParameter.QUERY,
            required=True,
            description="Report month in YYYY-MM format.",
            examples=[
                OpenApiExample(
                    "September 2026",
                    value="2026-09",
                ),
            ],
        ),
        OpenApiParameter(
            name="report_format",
            type=str,
            location=OpenApiParameter.QUERY,
            required=False,
            description="Report format: json, csv, or excel.",
            examples=[
                OpenApiExample(
                    "JSON",
                    value="json",
                ),
                OpenApiExample(
                    "CSV",
                    value="csv",
                ),
                OpenApiExample(
                    "Excel",
                    value="excel",
                ),
            ],
        ),
        
        OpenApiParameter(
            name="employee_id",
            type=str,
            location=OpenApiParameter.QUERY,
            required=False,
            description=(
                "Optional employee UID. "
                "When provided, the report is generated "
                "for only that employee."
            ),
            examples=[
                OpenApiExample(
                    "Employee EMP004",
                    value="EMP004",
                ),
            ],
        ),
    ],
)
    @action(
    detail=False,
    methods=["get"],
    url_path="report",
)
    def report(self, request):

        # --------------------------------------------------
        # 1. Get query parameters
        # --------------------------------------------------

        month = request.query_params.get("month")
        report_format = request.query_params.get(
            "report_format",
            "json",
        ).lower()
        
        employee_id = request.query_params.get(
            "employee_id"
            )

        # --------------------------------------------------
        # 2. Validate month
        # --------------------------------------------------

        if not month:
            return Response(
                {
                    "error": "The 'month' parameter is required.",
                    "example": "2026-09",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            month_date = datetime.strptime(
                month,
                "%Y-%m",
            ).date()

        except ValueError:
            return Response(
                {
                    "error": "Invalid month format.",
                    "message": "Use YYYY-MM format.",
                    "example": "2026-09",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # 3. Validate report format
        # --------------------------------------------------

        allowed_formats = [
            "json",
            "csv",
            "excel",
        ]

        if report_format not in allowed_formats:
            return Response(
                {
                    "error": "Invalid report format.",
                    "allowed_formats": allowed_formats,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # 4. Get first and last day of selected month
        # --------------------------------------------------

        start_date = month_date.replace(day=1)

        last_day = monthrange(
            month_date.year,
            month_date.month,
        )[1]

        month_end_date = month_date.replace(day=last_day)

        today = date.today()

        # If selected month is the current month,
        # report only up to today.
        if (
            month_date.year == today.year
            and month_date.month == today.month
        ):
            end_date = today
        else:
            end_date = month_end_date

        # ==================================================
        # MONTHLY SUMMARY
        # ==================================================

        monthly_summary = []

        employees = (
            Employee.objects
            .select_related("department")
            .order_by(employee_id)
            # .order_by("name")
        )
        
        if employee_id:
            employees = employees.filter(
                employee_id=employee_id
            )
            
        if not employees.exists():
            return Response(
                {
                    "error": "Employee not found.",
                    "employee_id": employee_id,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        for employee in employees:

            attendance_records = (
                Attendance.objects
                .filter(
                    employee=employee,
                    date__range=[
                        start_date,
                        end_date,
                    ],
                )
                .order_by(
                    "date",
                    "check_in",
                )
            )

            present_days = 0
            total_check_ins = 0
            total_check_outs = 0
            missing_check_out = 0

            total_seconds = 0

            first_check_in = None
            last_check_out = None

            for attendance in attendance_records:

                # ------------------------------------------
                # Check-in
                # ------------------------------------------

                if attendance.check_in:

                    total_check_ins += 1
                    present_days += 1

                    if (
                        first_check_in is None
                        or attendance.check_in < first_check_in
                    ):
                        first_check_in = attendance.check_in

                # ------------------------------------------
                # Check-out
                # ------------------------------------------

                if attendance.check_out:

                    total_check_outs += 1

                    if (
                        last_check_out is None
                        or attendance.check_out > last_check_out
                    ):
                        last_check_out = attendance.check_out

                # ------------------------------------------
                # Missing check-out
                # ------------------------------------------

                if (
                    attendance.check_in
                    and not attendance.check_out
                ):
                    missing_check_out += 1

                # ------------------------------------------
                # Calculate hours worked
                # ------------------------------------------

                if (
                    attendance.check_in
                    and attendance.check_out
                ):

                    check_in_datetime = datetime.combine(
                    attendance.date,
                    attendance.check_in,
                    )

                    check_out_datetime = datetime.combine(
                        attendance.date,
                        attendance.check_out,
                    )

                    duration = (
                        check_out_datetime
                        - check_in_datetime
                    )

                    seconds = int(
                        duration.total_seconds()
                    )

                    if seconds > 0:
                        total_seconds += seconds

            # ----------------------------------------------
            # Convert total seconds to hours/minutes
            # ----------------------------------------------

            total_hours = total_seconds // 3600
            total_minutes = (
                total_seconds % 3600
            ) // 60

            total_hours_display = (
                f"{total_hours}h "
                f"{total_minutes}m"
            )

            # ----------------------------------------------
            # Average hours
            # ----------------------------------------------

            if present_days > 0:

                average_seconds = (
                    total_seconds // present_days
                )

                average_hours = (
                    average_seconds // 3600
                )

                average_minutes = (
                    average_seconds % 3600
                ) // 60

                average_hours_display = (
                    f"{average_hours}h "
                    f"{average_minutes}m"
                )

            else:

                average_hours_display = "0h 0m"

            # ----------------------------------------------
            # Monthly summary row
            # ----------------------------------------------

            monthly_summary.append(
                {
                    "employee_name": employee.name,
                    "employee_id": employee.employee_id,
                    "uid": employee.uid,
                    "department": employee.department.name,
                    "present_days": present_days,
                    "total_check_ins": total_check_ins,
                    "total_check_outs": total_check_outs,
                    "missing_check_out": missing_check_out,
                    "total_hours": total_hours_display,
                    "average_hours": average_hours_display,
                    "first_check_in": (
                        first_check_in.strftime("%H:%M:%S")
                        if first_check_in
                        else None
                    ),
                    "last_check_out": (
                        last_check_out.strftime("%H:%M:%S")
                        if last_check_out
                        else None
                    ),
                }
            )

        # ==================================================
        # DAILY DETAILS
        # ==================================================

        daily_details = []

        # Only generate daily details for the selected employee
        # when employee_id is provided.
        daily_employees = employees

        for employee in daily_employees:

            # Get all attendance records for this employee
            # within the report period.
            attendance_records = (
                Attendance.objects
                .filter(
                    employee=employee,
                    date__range=[
                        start_date,
                        end_date,
                    ],
                )
                .order_by(
                    "date",
                    "check_in",
                )
            )

            # Create a lookup dictionary:
            # date -> attendance record
            attendance_by_date = {
                attendance.date: attendance
                for attendance in attendance_records
            }

            current_date = start_date

            while current_date <= end_date:

                attendance = attendance_by_date.get(
                    current_date
                )

                # --------------------------------------------------
                # Weekend
                # --------------------------------------------------
                if current_date.weekday() >= 5:
                    status_display = "Weekend"

                # --------------------------------------------------
                # Present
                # --------------------------------------------------
                elif attendance and attendance.check_in:
                    status_display = "Present"

                # --------------------------------------------------
                # Absent
                # --------------------------------------------------
                else:
                    status_display = "Absent"

                # --------------------------------------------------
                # Default values
                # --------------------------------------------------
                check_in_display = None
                check_out_display = None
                hours_worked = "0h 0m"

                # --------------------------------------------------
                # Attendance exists
                # --------------------------------------------------
                if attendance:

                    if attendance.check_in:
                        check_in_display = (
                            attendance.check_in.strftime(
                                "%H:%M:%S"
                            )
                        )

                    if attendance.check_out:
                        check_out_display = (
                            attendance.check_out.strftime(
                                "%H:%M:%S"
                            )
                        )

                    # --------------------------------------------------
                    # Calculate hours worked
                    # --------------------------------------------------
                    if (
                        attendance.check_in
                        and attendance.check_out
                    ):

                        check_in_datetime = datetime.combine(
                            attendance.date,
                            attendance.check_in,
                        )

                        check_out_datetime = datetime.combine(
                            attendance.date,
                            attendance.check_out,
                        )

                        duration = (
                            check_out_datetime
                            - check_in_datetime
                        )

                        seconds = int(
                            duration.total_seconds()
                        )

                        if seconds > 0:

                            hours = seconds // 3600

                            minutes = (
                                seconds % 3600
                            ) // 60

                            hours_worked = (
                                f"{hours}h "
                                f"{minutes}m"
                            )

                # --------------------------------------------------
                # Add daily row
                # --------------------------------------------------
                daily_details.append(
                    {
                        "date": current_date.strftime(
                            "%Y-%m-%d"
                        ),

                        "day": current_date.strftime(
                            "%A"
                        ),

                        "employee_name": employee.name,

                        "employee_id": employee.employee_id,

                        "uid": employee.uid,

                        "department": employee.department.name,

                        "check_in": check_in_display,

                        "check_out": check_out_display,

                        "hours_worked": hours_worked,

                        "status": status_display,
                    }
                )

                current_date += timedelta(days=1)
                
        
        daily_details.sort(
            key=lambda row: row["employee_id"] or ""
            )

        # ==================================================
        # JSON RESPONSE
        # ==================================================

        if report_format == "json":

            return Response(
                {
                    "month": month,
                    "employee_count": len(
                        monthly_summary
                    ),
                    "monthly_summary": monthly_summary,
                    "daily_details": daily_details,
                }
            )

        # ==================================================
        # CSV RESPONSE
        # ==================================================

        if report_format == "csv":

            response = HttpResponse(
                content_type="text/csv"
            )

            response["Content-Disposition"] = (
                f'attachment; '
                f'filename="attendance_report_{month}.csv"'
            )

            writer = csv.writer(response)

            # ----------------------------------------------
            # Monthly Summary
            # ----------------------------------------------

            writer.writerow(
                ["MONTHLY SUMMARY"]
            )

            writer.writerow(
                [
                    "Employee ID",
                    "Employee",
                    "UID",
                    "Department",
                    "Present Days",
                    "Total Check-ins",
                    "Total Check-outs",
                    "Missing Check-out",
                    "Total Hours",
                    "Average Hours",
                    "First Check In",
                    "Last Check Out",
                ]
            )

            for row in monthly_summary:

                writer.writerow(
                    [
                        row["employee_id"],
                        row["employee_name"],
                        row["uid"],
                        row["department"],
                        row["present_days"],
                        row["total_check_ins"],
                        row["total_check_outs"],
                        row["missing_check_out"],
                        row["total_hours"],
                        row["average_hours"],
                        row["first_check_in"] or "-",
                        row["last_check_out"] or "-",
                    ]
                )

            # ----------------------------------------------
            # Empty rows between sections
            # ----------------------------------------------

            writer.writerow([])
            writer.writerow([])

            # ----------------------------------------------
            # Daily Details
            # ----------------------------------------------

            writer.writerow(
                ["DAILY DETAILS"]
            )

            writer.writerow(
                [
                    "Date",
                    "Employee ID",
                    "UID",
                    "Employee",
                    "Department",
                    "Check In",
                    "Check Out",
                    "Hours Worked",
                ]
            )

            for row in daily_details:

                writer.writerow(
                    [
                        row["date"],
                        row["employee_id"],
                        row["uid"],
                        row["employee_name"],
                        row["department"],
                        row["check_in"] or "-",
                        row["check_out"] or "-",
                        row["hours_worked"],
                    ]
                )

            return response

        # ==================================================
        # EXCEL RESPONSE
        # ==================================================

        if report_format == "excel":

            from openpyxl import Workbook

            workbook = Workbook()

            # ----------------------------------------------
            # Sheet 1: Monthly Summary
            # ----------------------------------------------

            summary_sheet = workbook.active

            summary_sheet.title = "Monthly Summary"

            summary_headers = [
                "Employee ID",
                "Employee",
                "UID",
                "Department",
                "Present Days",
                "Total Check-ins",
                "Total Check-outs",
                "Missing Check-out",
                "Total Hours",
                "Average Hours",
                "First Check In",
                "Last Check Out",
            ]

            summary_sheet.append(
                summary_headers
            )

            for row in monthly_summary:

                summary_sheet.append(
                    [
                        row["employee_id"],
                        row["employee_name"],
                        row["uid"],
                        row["department"],
                        row["present_days"],
                        row["total_check_ins"],
                        row["total_check_outs"],
                        row["missing_check_out"],
                        row["total_hours"],
                        row["average_hours"],
                        row["first_check_in"] or "-",
                        row["last_check_out"] or "-",
                    ]
                )

            # ----------------------------------------------
            # Sheet 2: Daily Details
            # ----------------------------------------------

            details_sheet = workbook.create_sheet(
                "Daily Details"
            )

            detail_headers = [
                "Date",
                "Employee ID",
                "UID",
                "Employee",
                "Department",
                "Check In",
                "Check Out",
                "Hours Worked",
            ]

            details_sheet.append(
                detail_headers
            )

            for row in daily_details:

                details_sheet.append(
                    [
                        row["date"],
                        row["employee_id"],
                        row["uid"],
                        row["employee_name"],
                        row["department"],
                        row["check_in"] or "-",
                        row["check_out"] or "-",
                        row["hours_worked"],
                    ]
                )

            # ----------------------------------------------
            # Adjust column widths
            # ----------------------------------------------

            for sheet in [
                summary_sheet,
                details_sheet,
            ]:

                for column in sheet.columns:

                    max_length = 0

                    column_letter = (
                        column[0].column_letter
                    )

                    for cell in column:

                        if cell.value is not None:

                            max_length = max(
                                max_length,
                                len(str(cell.value)),
                            )

                    sheet.column_dimensions[
                        column_letter
                    ].width = min(
                        max_length + 2,
                        30,
                    )

            # ----------------------------------------------
            # Save Excel file
            # ----------------------------------------------

            output = BytesIO()

            workbook.save(output)

            output.seek(0)

            response = HttpResponse(
                output.getvalue(),
                content_type=(
                    "application/vnd.openxmlformats-officedocument."
                    "spreadsheetml.sheet"
                ),
            )

            response["Content-Disposition"] = (
                f'attachment; '
                f'filename="attendance_report_{month}.xlsx"'
            )

            return response
        

    # Check-in & Check-out schema
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
        
        
        
        
    # RFID automatic check-in / check-out
    @extend_schema(
        request=UIDAttendanceSerializer,
        responses={
            200: OpenApiResponse(
                description="RFID attendance processed successfully."
            ),
            400: OpenApiResponse(
                description="Attendance cannot be processed."
            ),
            404: OpenApiResponse(
                description="Employee not found or inactive."
            ),
        },
        summary="RFID Attendance Scan",
        description=(
            "Process an RFID scan using the employee's RFID UID. "
            "The server automatically determines whether the scan "
            "is a check-in or check-out."
        ),
        examples=[
            OpenApiExample(
                "RFID Scan",
                value={
                    "uid": "04A37B91"
                },
                request_only=True,
            ),
        ],
        tags=["Attendance"],
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="rfid-scan",
    )
    def rfid_scan(self, request):
        # --------------------------------------------------
        # 1. Validate RFID UID
        # --------------------------------------------------

        serializer = UIDAttendanceSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        uid = serializer.validated_data["uid"]

        # --------------------------------------------------
        # 2. Find active employee
        # --------------------------------------------------

        try:
            employee = (
                Employee.objects
                .select_related("department")
                .get(
                    uid=uid,
                    is_active=True,
                )
            )

        except Employee.DoesNotExist:
            return Response(
                {
                    "error": "Employee not found or inactive.",
                    "uid": uid,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --------------------------------------------------
        # 3. Get Nepal/local date and time
        # --------------------------------------------------

        now = timezone.localtime()

        today = now.date()

        current_time = now.time().replace(
            microsecond=0
        )

        # --------------------------------------------------
        # 4. Process attendance safely
        # --------------------------------------------------

        with transaction.atomic():

            attendance, created = (
                Attendance.objects
                .select_for_update()
                .get_or_create(
                    employee=employee,
                    date=today,
                    defaults={
                        "check_in": current_time,
                    },
                )
            )

            # --------------------------------------------------
            # CASE 1:
            # No attendance record existed
            # → CHECK IN
            # --------------------------------------------------

            if created:

                return Response(
                    {
                        "message": "Check-in successful.",
                        "status": "IN",
                        "uid": employee.uid,
                        "employee_id": employee.employee_id,
                        "employee_name": employee.name,
                        "department": employee.department.name,
                        "date": attendance.date,
                        "check_in": attendance.check_in,
                        "check_out": None,
                    },
                    status=status.HTTP_200_OK,
                )

            # --------------------------------------------------
            # CASE 2:
            # Record exists but no check-in
            # → CHECK IN
            # --------------------------------------------------

            if attendance.check_in is None:

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
                        "status": "IN",
                        "uid": employee.uid,
                        "employee_id": employee.employee_id,
                        "employee_name": employee.name,
                        "department": employee.department.name,
                        "date": attendance.date,
                        "check_in": attendance.check_in,
                        "check_out": None,
                    },
                    status=status.HTTP_200_OK,
                )

            # --------------------------------------------------
            # CASE 3:
            # Check-in exists, check-out empty
            # → CHECK OUT
            # --------------------------------------------------

            if attendance.check_out is None:

                check_in_datetime = datetime.combine(
                    attendance.date,
                    attendance.check_in,
                )

                check_out_datetime = datetime.combine(
                    attendance.date,
                    current_time,
                )

                duration = (
                    check_out_datetime
                    - check_in_datetime
                )

                total_seconds = int(
                    duration.total_seconds()
                )

                if total_seconds < 0:
                    return Response(
                        {
                            "error": (
                                "Check-out time cannot be "
                                "before check-in time."
                            ),
                            "uid": employee.uid,
                            "employee_id": employee.employee_id,
                            "check_in": attendance.check_in,
                            "check_out": current_time,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                hours = total_seconds // 3600

                minutes = (
                    total_seconds % 3600
                ) // 60

                seconds = (
                    total_seconds % 60
                )

                working_hours = (
                    f"{hours:02d}:"
                    f"{minutes:02d}:"
                    f"{seconds:02d}"
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
                        "status": "OUT",
                        "uid": employee.uid,
                        "employee_id": employee.employee_id,
                        "employee_name": employee.name,
                        "department": employee.department.name,
                        "date": attendance.date,
                        "check_in": attendance.check_in,
                        "check_out": attendance.check_out,
                        "working_hours": working_hours,
                    },
                    status=status.HTTP_200_OK,
                )

            # --------------------------------------------------
            # CASE 4:
            # Already checked in and checked out
            # → ERROR
            # --------------------------------------------------

            return Response(
                {
                    "error": "Employee has already checked out today.",
                    "uid": employee.uid,
                    "employee_id": employee.employee_id,
                    "employee_name": employee.name,
                    "date": attendance.date,
                    "check_in": attendance.check_in,
                    "check_out": attendance.check_out,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )