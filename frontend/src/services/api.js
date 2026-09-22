const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"


// Pull a readable message out of a DRF error body.
async function readError(response, fallback) {
  try {
    const data = await response.json()

    if (typeof data === "string") {
      return data
    }

    if (data.error || data.detail) {
      return data.error || data.detail
    }

    const firstField = Object.entries(data)[0]

    if (firstField) {
      const [field, messages] = firstField
      const text = Array.isArray(messages)
        ? messages[0]
        : messages

      return `${field}: ${text}`
    }
  } catch {
    // Body was empty or not JSON.
  }

  return fallback
}


// Employees

export async function getEmployees() {
  const response = await fetch(
    `${API_BASE_URL}/employees/`
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to load employees."
      )
    )
  }

  return response.json()
}


export async function createEmployee(employeeData) {
  const response = await fetch(
    `${API_BASE_URL}/employees/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to create employee."
      )
    )
  }

  return response.json()
}


export async function updateEmployee(
  employeeId,
  employeeData
) {
  const response = await fetch(
    `${API_BASE_URL}/employees/${employeeId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to update employee."
      )
    )
  }

  return response.json()
}


export async function deleteEmployee(employeeId) {
  const response = await fetch(
    `${API_BASE_URL}/employees/${employeeId}/`,
    {
      method: "DELETE",
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to delete employee."
      )
    )
  }

  return true
}


// Departments

export async function getDepartments() {
  const response = await fetch(
    `${API_BASE_URL}/departments/`
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to load departments."
      )
    )
  }

  return response.json()
}


export async function createDepartment(
  departmentData
) {
  const response = await fetch(
    `${API_BASE_URL}/departments/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(departmentData),
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to create department."
      )
    )
  }

  return response.json()
}


export async function updateDepartment(
  departmentId,
  departmentData
) {
  const response = await fetch(
    `${API_BASE_URL}/departments/${departmentId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(departmentData),
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to update department."
      )
    )
  }

  return response.json()
}


export async function deleteDepartment(
  departmentId
) {
  const response = await fetch(
    `${API_BASE_URL}/departments/${departmentId}/`,
    {
      method: "DELETE",
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to delete department."
      )
    )
  }

  return true
}


// Attendance

export async function getAttendance(date = "") {
  const url = date
    ? `${API_BASE_URL}/attendance/?date=${encodeURIComponent(
        date
      )}`
    : `${API_BASE_URL}/attendance/`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to load attendance."
      )
    )
  }

  return response.json()
}


export async function checkIn(uid) {
  const response = await fetch(
    `${API_BASE_URL}/attendance/check-in/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid.trim(),
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Check-in failed."
      )
    )
  }

  return response.json()
}


export async function checkOut(uid) {
  const response = await fetch(
    `${API_BASE_URL}/attendance/check-out/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid.trim(),
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Check-out failed."
      )
    )
  }

  return response.json()
}


// Monthly report

function reportUrl(
  month,
  format,
  employeeId = ""
) {
  let url =
    `${API_BASE_URL}/attendance/report/?month=${encodeURIComponent(
      month
    )}&report_format=${format}`

  // Add employee_id only when an individual
  // employee report is requested.
  if (employeeId) {
    url += `&employee_id=${encodeURIComponent(
      employeeId
    )}`
  }

  return url
}


export async function getMonthlyReport(
  month,
  employeeId = ""
) {
  const response = await fetch(
    reportUrl(
      month,
      "json",
      employeeId
    )
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Failed to generate the monthly report."
      )
    )
  }

  return response.json()
}


async function downloadReport(
  month,
  format,
  filename,
  employeeId = ""
) {
  const response = await fetch(
    reportUrl(
      month,
      format,
      employeeId
    )
  )

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        `Failed to download the ${format} report.`
      )
    )
  }

  const blob = await response.blob()

  // A JSON body here means the backend fell
  // back to an error payload. Saving it would
  // produce a broken file with the right extension.
  if (blob.type.includes("application/json")) {
    const text = await blob.text()

    try {
      const data = JSON.parse(text)

      throw new Error(
        data.error ||
          data.detail ||
          "The report is empty."
      )
    } catch (err) {
      // eslint-disable-next-line preserve-caught-error
      throw new Error(
        err.message ||
          "The report is empty."
      )
    }
  }

  const url =
    window.URL.createObjectURL(blob)

  const link =
    document.createElement("a")

  link.href = url
  link.download = filename

  document.body.appendChild(link)

  link.click()

  link.remove()

  window.URL.revokeObjectURL(url)
}


export function downloadMonthlyReportCSV(
  month,
  employeeId = ""
) {
  const filename = employeeId
    ? `attendance_report_${employeeId}_${month}.csv`
    : `attendance_report_${month}.csv`

  return downloadReport(
    month,
    "csv",
    filename,
    employeeId
  )
}


export function downloadMonthlyReportExcel(
  month,
  employeeId = ""
) {
  const filename = employeeId
    ? `attendance_report_${employeeId}_${month}.xlsx`
    : `attendance_report_${month}.xlsx`

  return downloadReport(
    month,
    "excel",
    filename,
    employeeId
  )
}