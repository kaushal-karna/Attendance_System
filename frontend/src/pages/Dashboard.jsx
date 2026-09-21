import { getLocalDate } from "../utils/format"
import { formatTime } from "../utils/time"

function Dashboard({
  employees,
  departments,
  attendance,
  onNavigate,
}) {
  const today = getLocalDate()

  const presentToday = attendance.filter(
    (record) => record.date === today && record.check_in
  ).length

  const notCheckedIn = employees.filter(
    (employee) =>
      employee.is_active &&
      !attendance.some(
        (record) =>
          record.uid === employee.uid &&
          record.date === today &&
          record.check_in
      )
  ).length

  // Sort by updated_at (or date/check_in) so today's newest scans come first,
  // and show only the top 3 records to keep the dashboard tidy.
  const recentAttendance = [...attendance]
    .sort((a, b) => {
      const timeB = b.updated_at || `${b.date}T${b.check_in || "00:00:00"}`
      const timeA = a.updated_at || `${a.date}T${a.check_in || "00:00:00"}`
      return String(timeB).localeCompare(String(timeA))
    })
    .slice(0, 3)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Attendance overview for {today}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Total employees</div>
          <div className="stat-card-value">{employees.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Present today</div>
          <div className="stat-card-value">{presentToday}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Not checked in</div>
          <div className="stat-card-value">{notCheckedIn}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Departments</div>
          <div className="stat-card-value">{departments.length}</div>
        </div>
      </div>

      <div className="section-header">
        <h2>Recent attendance</h2>

        {onNavigate && (
          <button
            type="button"
            className="button secondary"
            onClick={() => onNavigate("Monthly Reports")}
          >
            Open monthly reports
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee ID</th>
              <th>Employee</th>
              <th>Check in</th>
              <th>Check out</th>
            </tr>
          </thead>

          <tbody>
            {recentAttendance.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-message">
                  No attendance yet. Scan a UID on the Attendance page to
                  record the first check-in.
                </td>
              </tr>
            ) : (
              recentAttendance.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.employee_id}</td>
                  <td>{record.employee_name}</td>
                  <td>{formatTime(record.check_in)}</td>
                  <td>{formatTime(record.check_out)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard