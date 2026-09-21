import { useState } from "react"
import EmployeeForm from "../components/EmployeeForm"

function Employees({
  employees,
  departments,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

  function handleAdd() {
    setEditingEmployee(null)
    setShowForm(true)
  }

  function handleEdit(employee) {
    setEditingEmployee(employee)
    setShowForm(true)
  }

  async function handleSave(employeeData) {
    if (editingEmployee) {
      await onUpdate(editingEmployee.id, employeeData)
    } else {
      await onCreate(employeeData)
    }

    setShowForm(false)
    setEditingEmployee(null)
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(`Delete ${employee.name}?`)

    if (!confirmed) {
      return
    }

    await onDelete(employee.id)
  }

  return (
    <div className="page">
      <div className="page-header employee-header">
        <div>
          <h2>Employees</h2>
          <p>Manage employees in your organization.</p>
        </div>

        <button className="button primary" onClick={handleAdd}>
          + Add Employee
        </button>
      </div>

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          departments={departments}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingEmployee(null)
          }}
        />
      )}

      <div className="table-container">
        {employees.length === 0 ? (
          <p className="empty-message">No employees found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employee_id || "-"}</td>
                  <td>{employee.name}</td>
                  <td>{employee.department_name || "-"}</td>

                  <td>
                    <span
                      className={
                        employee.is_active
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      {employee.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="button small"
                        onClick={() => handleEdit(employee)}
                      >
                        Edit
                      </button>

                      <button
                        className="button small danger"
                        onClick={() => handleDelete(employee)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Employees