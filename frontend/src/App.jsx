import { useEffect, useState } from "react"

import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"

import Dashboard from "./pages/Dashboard"
import Employees from "./pages/Employees"
import Departments from "./pages/Departments"
import Attendance from "./pages/Attendance"
import MonthlyReports from "./pages/MonthlyReports"

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAttendance,
} from "./services/api"


function App() {
  const [currentPage, setCurrentPage] =
    useState("Dashboard")

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [attendance, setAttendance] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  // ==========================================
  // LOAD INITIAL DATA
  // ==========================================

  useEffect(() => {
    async function loadData() {
      try {
        const [
          employeesData,
          departmentsData,
          attendanceData,
        ] = await Promise.all([
          getEmployees(),
          getDepartments(),
          getAttendance(),
        ])

        setEmployees(employeesData)
        setDepartments(departmentsData)
        setAttendance(attendanceData)

      } catch (error) {
        console.error(error)
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])


  // ==========================================
  // CREATE EMPLOYEE
  // ==========================================

  async function handleCreateEmployee(employeeData) {
    const newEmployee =
      await createEmployee(employeeData)

    setEmployees((currentEmployees) => [
      ...currentEmployees,
      newEmployee,
    ])
  }


  // ==========================================
  // UPDATE EMPLOYEE
  // ==========================================

  async function handleUpdateEmployee(
    employeeId,
    employeeData
  ) {
    const updatedEmployee =
      await updateEmployee(
        employeeId,
        employeeData
      )

    setEmployees((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.id === employeeId
          ? updatedEmployee
          : employee
      )
    )
  }


  // ==========================================
  // DELETE EMPLOYEE
  // ==========================================

  async function handleDeleteEmployee(
    employeeId
  ) {
    await deleteEmployee(employeeId)

    setEmployees((currentEmployees) =>
      currentEmployees.filter(
        (employee) =>
          employee.id !== employeeId
      )
    )
  }



  // ==========================================
  // CREATE DEPARTMENT
  // ==========================================
  async function handleCreateDepartment(
  departmentData
) {
  const newDepartment =
    await createDepartment(departmentData)

  setDepartments((currentDepartments) => [
    ...currentDepartments,
    newDepartment,
  ])
}


// ==========================================
//  UPDATE DEPARTMENT
// ==========================================
async function handleUpdateDepartment(
  departmentId,
  departmentData
) {
  const updatedDepartment =
    await updateDepartment(
      departmentId,
      departmentData
    )

  setDepartments((currentDepartments) =>
    currentDepartments.map((department) =>
      department.id === departmentId
        ? updatedDepartment
        : department
    )
  )
}


// ==========================================
//  DELETE DEPARTMENT
// ==========================================
async function handleDeleteDepartment(
  departmentId
) {
  await deleteDepartment(departmentId)

  setDepartments((currentDepartments) =>
    currentDepartments.filter(
      (department) =>
        department.id !== departmentId
    )
  )
}

// Attendance filter
async function handleAttendanceFilter(date) {
  try {
    const data = await getAttendance(date)
    setAttendance(data)
  } catch (error) {
    setError(error.message)
  }
}


  // ==========================================
  // PAGE RENDERING
  // ==========================================

  function renderPage() {
    switch (currentPage) {

      case "Employees":
        return (
          <Employees
            employees={employees}
            departments={departments}
            onCreate={handleCreateEmployee}
            onUpdate={handleUpdateEmployee}
            onDelete={handleDeleteEmployee}
          />
        )

      case "Departments":
        return (
          <Departments
            departments={departments}
            onCreate={handleCreateDepartment}
            onUpdate={handleUpdateDepartment}
            onDelete={handleDeleteDepartment}
          />
        )

      case "Attendance":
        return (
          <Attendance
            attendance={attendance}
            onFilter={handleAttendanceFilter}
          />
        )

      case "Monthly Reports":
            return (
                <MonthlyReports />
            )

      default:
        return (
          <Dashboard
            employees={employees}
            departments={departments}
            attendance={attendance}
          />
        )
    }
  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    )
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="error">
        Error: {error}
      </div>
    )
  }


  // ==========================================
  // APP
  // ==========================================

  return (
    <div className="app">

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="main-content">

        <Navbar
          currentPage={currentPage}
        />

        <main>
          {renderPage()}
        </main>

      </div>

    </div>
  )
}

export default App

