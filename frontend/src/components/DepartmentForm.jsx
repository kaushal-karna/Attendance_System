import { useEffect, useState } from "react"

function DepartmentForm({
  department,
  onSave,
  onCancel,
}) {
  const [name, setName] = useState("")
  const [description, setDescription] =
    useState("")

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const isEditing = Boolean(department)

  useEffect(() => {
    if (department) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(department.name || "")
      setDescription(
        department.description || ""
      )
    } else {
      setName("")
      setDescription("")
    }

    setError("")
  }, [department])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setError("Department name is required")
      return
    }

    try {
      setSaving(true)
      setError("")

      await onSave({
        name: name.trim(),
        description: description.trim(),
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
        <h2>
          {isEditing
            ? "Edit Department"
            : "Add Department"}
        </h2>

        <button
          type="button"
          className="close-button"
          onClick={onCancel}
        >
          ×
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="department-name">
            Department Name
          </label>

          <input
            id="department-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Information Technology"
          />
        </div>

        <div className="form-group">
          <label htmlFor="department-description">
            Description
          </label>

          <textarea
            id="department-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Department description..."
            rows="4"
          />
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
                ? "Update Department"
                : "Add Department"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DepartmentForm