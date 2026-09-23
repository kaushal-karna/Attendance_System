import { useEffect, useState } from "react";

import {
  getEmployees,
  getMonthlyReport,
  downloadMonthlyReportCSV,
  downloadMonthlyReportExcel,
} from "../services/api";

import { getLocalMonth, formatNumber } from "../utils/format";
import { formatTime } from "../utils/time";

function MonthlyReports() {
  const [month, setMonth] = useState(getLocalMonth());
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);

  const [report, setReport] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  // Load employees for the employee dropdown
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setError("");

        const data = await getEmployees();

        // Supports both:
        // 1. Normal DRF list: [...]
        // 2. Paginated DRF response: { results: [...] }
        const employeeList = Array.isArray(data) ? data : (data?.results ?? []);

        // Sort employees by Employee ID
        const sortedEmployees = [...employeeList].sort((a, b) =>
          (a.employee_id || "").localeCompare(b.employee_id || "", undefined, {
            numeric: true,
          }),
        );

        setEmployees(sortedEmployees);
      } catch (err) {
        console.error(err);

        setError(err.message || "Failed to load employees.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  // Generate monthly report
  const generateReport = async () => {
    if (!month) {
      setError("Select a month first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getMonthlyReport(month, employeeId);

      setReport(data);
    } catch (err) {
      console.error(err);

      setError(err.message || "The report could not be generated.");

      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Download CSV / Excel
  const exportFile = async (format) => {
    if (!month) {
      setError("Select a month first.");
      return;
    }

    try {
      setError("");
      setDownloading(format);

      if (format === "csv") {
        await downloadMonthlyReportCSV(month, employeeId);
      } else {
        await downloadMonthlyReportExcel(month, employeeId);
      }
    } catch (err) {
      console.error(err);

      setError(err.message || `The ${format} file could not be downloaded.`);
    } finally {
      setDownloading("");
    }
  };

  const summary = report?.monthly_summary ?? [];
  const daily = report?.daily_details ?? [];

  // Find selected employee for heading
  const selectedEmployee = employees.find(
    (employee) => employee.employee_id === employeeId,
  );

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Monthly attendance report</h1>

        <p>View a month of attendance, then download it as CSV or Excel.</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {/* Month */}
        <div className="form-group">
          <label htmlFor="report-month">Month</label>

          <input
            id="report-month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>

        {/* Employee */}
        <div className="form-group">
          <label htmlFor="report-employee">Employee</label>

          <select
            id="report-employee"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            disabled={loadingEmployees}
          >
            <option value="">All employees</option>

            {employees.map((employee) => (
              <option key={employee.employee_id} value={employee.employee_id}>
                {employee.employee_id} - {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="filter-actions">
          {/* Generate */}
          <button
            type="button"
            className="button primary"
            onClick={generateReport}
            disabled={loading || loadingEmployees}
          >
            {loading ? "Generating..." : "Generate report"}
          </button>

          {/* CSV */}
          <button
            type="button"
            className="button success"
            onClick={() => exportFile("csv")}
            disabled={downloading !== ""}
          >
            {downloading === "csv" ? "Downloading..." : "Download CSV"}
          </button>

          {/* Excel */}
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

      {/* Error */}
      {error && <div className="form-error">{error}</div>}

      {/* Report */}
      {report && (
        <>
          {/* Summary heading */}
          <div className="section-header">
            <h2>
              {selectedEmployee
                ? `Report for ${selectedEmployee.name} (${selectedEmployee.employee_id})`
                : `Summary for ${report.month || month}`}
            </h2>
          </div>

          {/* Summary table */}
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
                  [...summary]
                    .sort((a, b) =>
                      (a.employee_id || "").localeCompare(
                        b.employee_id || "",
                        undefined,
                        { numeric: true },
                      ),
                    )
                    .map((employee) => (
                      <tr key={employee.employee_id || employee.uid}>
                        <td>{employee.employee_name}</td>

                        <td>{employee.employee_id || "-"}</td>

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

          {/* Daily details heading */}
          <div className="section-header">
            <h2>Daily details</h2>
          </div>

          {/* Daily details table */}
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
                  [...daily]
                    .sort((a, b) =>
                      (a.employee_id || "").localeCompare(
                        b.employee_id || "",
                        undefined,
                        { numeric: true },
                      ),
                    )
                    .map((record, index) => (
                      <tr
                        key={`${record.employee_id || record.uid}-${record.date}-${index}`}
                      >
                        <td>{record.date}</td>

                        <td>{record.employee_id || "-"}</td>

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
  );
}

export default MonthlyReports;
