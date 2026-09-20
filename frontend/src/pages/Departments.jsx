import { useState } from "react"

import DepartmentForm from "../components/DepartmentForm"

function Departments({
  departments,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] =
    useState(false)

  const [editingDepartment, setEditingDepartment] =
    useState(null)

  function handleAdd() {
    setEditingDepartment(null)
    setShowForm(true)
  }

  function handleEdit(department) {
    setEditingDepartment(department)
    setShowForm(true)
  }

  async function handleSave(departmentData) {
    if (editingDepartment) {
      await onUpdate(
        editingDepartment.id,
        departmentData
      )
    } else {
      await onCreate(departmentData)
    }

    setShowForm(false)
    setEditingDepartment(null)
  }

  async function handleDelete(department) {
    const confirmed = window.confirm(
      `Delete ${department.name}?`
    )

    if (!confirmed) {
      return
    }

    await onDelete(department.id)
  }

  return (
    <div className="page">
      <div className="page-header employee-header">
        <div>
          <h2>Departments</h2>

          <p>
            Manage organization departments.
          </p>
        </div>

        <button
          className="button primary"
          onClick={handleAdd}
        >
          + Add Department
        </button>
      </div>

      {showForm && (
        <DepartmentForm
          department={editingDepartment}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingDepartment(null)
          }}
        />
      )}

      <div className="table-container">
        {departments.length === 0 ? (
          <p className="empty-message">
            No departments found.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.id}</td>

                  <td>{department.name}</td>

                  <td>
                    {department.description ||
                      "-"}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="button small"
                        onClick={() =>
                          handleEdit(
                            department
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="button small danger"
                        onClick={() =>
                          handleDelete(
                            department
                          )
                        }
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

export default Departments