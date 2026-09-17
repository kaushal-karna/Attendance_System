from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AttendanceViewSet,
    DepartmentViewSet,
    EmployeeViewSet,
)


router = DefaultRouter()

router.register(
    "departments",
    DepartmentViewSet,
    basename="department",
)

router.register(
    "employees",
    EmployeeViewSet,
    basename="employee",
)

router.register(
    "attendance",
    AttendanceViewSet,
    basename="attendance",
)


urlpatterns = [
    path("", include(router.urls)),
]