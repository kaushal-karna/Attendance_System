import { useState } from "react";
import { formatTime } from "../utils/time";

import { checkIn, checkOut } from "../services/api";

function Attendance({ attendance, onFilter }) {
  const [uid, setUid] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeFormat, setTimeFormat] = useState("12h");
  const [dateFilter, setDateFilter] = useState("");

  async function handleCheckIn() {
    if (!uid.trim()) {
      setError("Please enter an employee UID.");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await checkIn(uid);

      setMessage(
        `${data.employee_name} checked in successfully at ${formatTime(
          data.check_in,
          timeFormat,
        )}.`,
      );

      setUid("");

      if (onFilter) {
        onFilter(dateFilter);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    if (!uid.trim()) {
      setError("Please enter an employee UID.");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await checkOut(uid);

      setMessage(
        `${data.employee_name} checked out successfully at ${formatTime(
          data.check_out,
          timeFormat,
        )}.`,
      );

      setUid("");

      if (onFilter) {
        onFilter(dateFilter);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleUidChange(event) {
    setUid(event.target.value);
    setError("");
    setMessage("");
  }

  function handleDateFilterChange(event) {
    const value = event.target.value;
    setDateFilter(value);

    if (onFilter) {
      onFilter(value);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Check employees in and out using their UID.</p>
      </div>

      <div className="attendance-scanner">
        <div className="scanner-header">
          <h2>Employee attendance scanner</h2>
          <p>Enter or scan an RFID.</p>
        </div>

        <div className="scanner-input">
          <label htmlFor="employee-uid">Employee RFID</label>

          <input
            id="employee-uid"
            type="text"
            placeholder="Example: A1B2C3D4"
            value={uid}
            onChange={handleUidChange}
            autoFocus
          />
        </div>

        <div className="scanner-actions">
          <button
            type="button"
            className="button primary"
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? "Processing..." : "Check in"}
          </button>

          <button
            type="button"
            className="button secondary"
            onClick={handleCheckOut}
            disabled={loading}
          >
            {loading ? "Processing..." : "Check out"}
          </button>
        </div>

        {message && <div className="attendance-success">{message}</div>}
        {error && <div className="attendance-error">{error}</div>}
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label htmlFor="attendance-date">Filter by date</label>

          <input
            id="attendance-date"
            type="date"
            value={dateFilter}
            onChange={handleDateFilterChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="time-format">Time format</label>

          <select
            id="time-format"
            value={timeFormat}
            onChange={(event) => setTimeFormat(event.target.value)}
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee ID</th>
              <th>RFID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Check in</th>
              <th>Check out</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-message">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              [...attendance]
                .sort((a, b) =>
                  a.employee_id.localeCompare(b.employee_id, undefined, {
                    numeric: true,
                  }),
                )
                .map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.employee_id}</td>
                    <td>{record.uid}</td>
                    <td>{record.employee_name}</td>
                    <td>{record.department_name || "-"}</td>
                    <td>{formatTime(record.check_in, timeFormat)}</td>
                    <td>{formatTime(record.check_out, timeFormat)}</td>
                    <td>
                      {record.check_out ? (
                        <span className="status completed">Completed</span>
                      ) : (
                        <span className="status pending">Checked in</span>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
