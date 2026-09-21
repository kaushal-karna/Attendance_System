import { useState } from "react"
import {
  getMonthlyReport,
  downloadMonthlyReportCSV,
  downloadMonthlyReportExcel,
} from "../services/api"
import { getLocalMonth, formatNumber } from "../utils/format"
import { formatTime } from "../utils/time"

function MonthlyReports() {
  const [month, setMonth] = useState(getLocalMonth())
  const [report, setReport] = useState(null)

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState("")
  const [error, setError] = useState("")

  const generateReport = async () => {
    if (!month) {
      setError("Select a month first.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const data = await getMonthlyReport(month)
      setReport(data)
    } catch (err) {
      console.error(err)
      setError(err.message || "The report could not be generated.")
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const exportFile = async (format) => {
    if (!month) {
      setError("Select a month first.")
      return
    }

    try {
      setError("")
      setDownloading(format)

      if (format === "csv") {
        await downloadMonthlyReportCSV(month)
      } else {
        await downloadMonthlyReportExcel(month)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || `The ${format} file could not be downloaded.`)
    } finally {
      setDownloading("")
    }
  }

  const summary = report?.monthly_summary ?? []
  const daily = report?.daily_details ?? []

  return (
    <div className="page">
      <div className="page-header">
        <h1>Monthly attendance report</h1>
        <p>View a month of attendance, then download it as CSV or Excel.</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label htmlFor="report-month">Month</label>

          <input
            id="report-month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="button primary"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate report"}
          </button>

          <button
            type="button"
            className="button success"
            onClick={() => exportFile("csv")}
            disabled={downloading !== ""}
          >
            {downloading === "csv" ? "Downloading..." : "Download CSV"}
          </button>

          <button
            type="button"
            className="button success-dark"
            onClick={() => exportFile("excel")}
            disabled={downloading !== ""}
          >
            {downloading === "excel" ? "Downloading..." : "Download Excel"}
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {report && (
        <>
          <div className="section-header">
            <h2>Summary for {report.month || month}</h2>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th className="align-center">Present days</th>
                  <th className="align-center">Check-ins</th>
                  <th className="align-center">Check-outs</th>
                  <th className="align-center">Missing check-out</th>
                  <th className="align-center">Total hours</th>
                  <th className="align-center">Average hours</th>
                </tr>
              </thead>

              <tbody>
                {summary.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-message">
                      No attendance was recorded in this month.
                    </td>
                  </tr>
                ) : (
                  summary.map((employee) => (
                    <tr key={employee.uid || employee.employee_id}>
                      <td>{employee.employee_name}</td>
                      <td>{employee.employee_id || employee.uid || "-"}</td>
                      <td>{employee.department || "-"}</td>
                      <td className="align-center">
                        {formatNumber(employee.present_days)}
                      </td>
                      <td className="align-center">
                        {formatNumber(employee.total_check_ins)}
                      </td>
                      <td className="align-center">
                        {formatNumber(employee.total_check_outs)}
                      </td>
                      <td className="align-center">
                        {formatNumber(employee.missing_check_out)}
                      </td>
                      <td className="align-center">
                        {formatNumber(employee.total_hours)}
                      </td>
                      <td className="align-center">
                        {formatNumber(employee.average_hours)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="section-header">
            <h2>Daily details</h2>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th className="align-center">Check in</th>
                  <th className="align-center">Check out</th>
                  <th className="align-center">Hours worked</th>
                </tr>
              </thead>

              <tbody>
                {daily.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      No daily records for this month.
                    </td>
                  </tr>
                ) : (
                  daily.map((record, index) => (
                    <tr key={`${record.uid || record.employee_id}-${record.date}-${index}`}>
                      <td>{record.date}</td>
                      <td>{record.employee_id || record.uid || "-"}</td>
                      <td>{record.employee_name}</td>
                      <td>{record.department || "-"}</td>
                      <td className="align-center">
                        {formatTime(record.check_in)}
                      </td>
                      <td className="align-center">
                        {formatTime(record.check_out)}
                      </td>
                      <td className="align-center">
                        {record.hours_worked ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default MonthlyReports