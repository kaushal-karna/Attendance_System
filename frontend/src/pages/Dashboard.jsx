// import { useState } from "react"
// import StatCard from "../components/StatCard"

// function Dashboard({
//   employees,
//   departments,
//   attendance,
// }) {
//   const today = new Date()
//     .toISOString()
//     .split("T")[0]

//   const [report, setReport] = useState(null)
//   const [reportMonth, setReportMonth] = useState(
//     today.slice(0, 7)
//   )
//   const [loadingReport, setLoadingReport] = useState(false)
//   const [reportError, setReportError] = useState("")

//   const presentToday = attendance.filter(
//     (record) =>
//       record.date === today &&
//       record.check_in
//   ).length

//   const notCheckedIn = employees.filter(
//     (employee) =>
//       employee.is_active &&
//       !attendance.some(
//         (record) =>
//           record.uid === employee.uid &&
//           record.date === today &&
//           record.check_in
//       )
//   ).length

//   const generateReport = async () => {
//     try {
//       setLoadingReport(true)
//       setReportError("")

//       const response = await fetch(
//         `http://127.0.0.1:8000/api/attendance/report/?month=${reportMonth}`
//       )

//       if (!response.ok) {
//         throw new Error("Failed to generate report")
//       }

//       const data = await response.json()

//       setReport(data)
//     } catch (error) {
//       console.error(error)
//       setReportError(
//         "Unable to generate report. Please check the backend."
//       )
//     } finally {
//       setLoadingReport(false)
//     }
//   }

//   return (
//     <div className="page">

//       <div className="page-header">
//         <div>
//           <h1>Dashboard</h1>
//           <p>Attendance Management System overview</p>
//         </div>
//       </div>

//       {/* Statistics */}
//       <div className="stats-grid">

//         <StatCard
//           title="Total Employees"
//           value={employees.length}
//         />

//         <StatCard
//           title="Present Today"
//           value={presentToday}
//         />

//         <StatCard
//           title="Not Checked In"
//           value={notCheckedIn}
//         />

//         <StatCard
//           title="Departments"
//           value={departments.length}
//         />

//       </div>

//       {/* Monthly Report */}
//       <div className="section-header">
//         <h2>Monthly Attendance Report</h2>
//       </div>

//       <div className="report-controls">

//         <div>
//           <label htmlFor="report-month">
//             Select Month
//           </label>

//           <input
//             id="report-month"
//             type="month"
//             value={reportMonth}
//             onChange={(e) =>
//               setReportMonth(e.target.value)
//             }
//           />
//         </div>

//         <button
//           type="button"
//           onClick={generateReport}
//           disabled={loadingReport}
//         >
//           {loadingReport
//             ? "Generating..."
//             : "Generate Report"}
//         </button>

//       </div>

//       {reportError && (
//         <div className="error-message">
//           {reportError}
//         </div>
//       )}

//       {/* Report Result */}
//       {report && (
//         <div className="table-container">

//           <table>

//             <thead>
//               <tr>
//                 <th>Employee</th>
//                 <th>UID</th>
//                 <th>Present Days</th>
//                 <th>Absent Days</th>
//                 <th>First Check In</th>
//                 <th>Last Check Out</th>
//               </tr>
//             </thead>

//             <tbody>

//               {report.monthly_summary?.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="empty-state"
//                   >
//                     No attendance data found.
//                   </td>
//                 </tr>
//               ) : (
//                 report.monthly_summary.map(
//                   (employee) => (
//                     <tr key={employee.uid}>

//                       <td>
//                         {employee.employee_name}
//                       </td>

//                       <td>
//                         {employee.uid}
//                       </td>

//                       <td>
//                         {employee.present_days ?? 0}
//                       </td>

//                       <td>
//                         {employee.absent_days ?? 0}
//                       </td>

//                       <td>
//                         {employee.first_check_in || "-"}
//                       </td>

//                       <td>
//                         {employee.last_check_out || "-"}
//                       </td>

//                     </tr>
//                   )
//                 )
//               )}

//             </tbody>

//           </table>

//         </div>
//       )}

//       {/* Recent Attendance */}
//       <div className="section-header">
//         <h2>Recent Attendance</h2>
//       </div>

//       <div className="table-container">

//         <table>

//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>UID</th>
//               <th>Employee</th>
//               <th>Check In</th>
//               <th>Check Out</th>
//             </tr>
//           </thead>

//           <tbody>

//             {attendance.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan="5"
//                   className="empty-state"
//                 >
//                   No attendance records found.
//                 </td>
//               </tr>
//             ) : (
//               attendance
//                 .slice(0, 5)
//                 .map((record) => (
//                   <tr key={record.id}>

//                     <td>{record.date}</td>

//                     <td>{record.uid}</td>

//                     <td>
//                       {record.employee_name}
//                     </td>

//                     <td>
//                       {record.check_in || "-"}
//                     </td>

//                     <td>
//                       {record.check_out || "-"}
//                     </td>

//                   </tr>
//                 ))
//             )}

//           </tbody>

//         </table>

//       </div>

//     </div>
//   )
// }

// export default Dashboard






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

  const recentAttendance = [...attendance]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5)

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
              <th>UID</th>
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
                  <td>{record.uid}</td>
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