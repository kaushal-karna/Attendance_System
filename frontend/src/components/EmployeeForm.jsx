import { useEffect, useState } from "react"

function EmployeeForm({
  employee,
  departments,
  onSave,
  onCancel,
}) {
  const [employeeId, setEmployeeId] = useState("")
  const [uid, setUid] = useState("")
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const isEditing = Boolean(employee)

  useEffect(() => {
    if (employee) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmployeeId(employee.employee_id || "")
      setUid(employee.uid || "")
      setName(employee.name || "")
      setDepartment(employee.department || "")
      setIsActive(employee.is_active ?? true)
    } else {
      setEmployeeId("")
      setUid("")
      setName("")
      setDepartment("")
      setIsActive(true)
    }

    setError("")
  }, [employee])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!employeeId.trim()) {
      setError("Employee ID is required")
      return
    }

    if (!uid.trim()) {
      setError("Card UID (RFID) is required")
      return
    }

    if (!name.trim()) {
      setError("Employee name is required")
      return
    }

    try {
      setSaving(true)
      setError("")

      await onSave({
        employee_id: employeeId.trim(),
        uid: uid.trim(),
        name: name.trim(),
        department: department ? Number(department) : null,
        is_active: isActive,
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-card">
      <div className="form-header">
        <h2>{isEditing ? "Edit Employee" : "Add Employee"}</h2>

        <button
          type="button"
          className="close-button"
          onClick={onCancel}
        >
          ×
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            type="text"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            placeholder="e.g. EMP001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="uid">Card UID (RFID)</label>
          <input
            id="uid"
            type="text"
            value={uid}
            onChange={(event) => setUid(event.target.value)}
            placeholder="e.g. 50F3E13F"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Employee Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ram Sharma"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>

        <div className="checkbox-group">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          <label htmlFor="isActive">Employee is active</label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="button primary"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Employee"
                : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm