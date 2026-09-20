// import { useState } from "react"

// import {
//   getMonthlyReport,
//   downloadMonthlyReportCSV,
//   downloadMonthlyReportExcel,
// } from "../services/api"


// function MonthlyReports() {
//   const [month, setMonth] = useState("")
//   const [report, setReport] = useState(null)

//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")


//   // Generate Monthly Report
//   const generateReport = async () => {
//     if (!month) {
//       setError("Please select a month.")
//       return
//     }

//     try {
//       setLoading(true)
//       setError("")

//       const data = await getMonthlyReport(month)

//       setReport(data)

//     } catch (error) {
//       console.error(error)

//       setError(
//         error.message || "Unable to generate attendance report."
//       )

//       setReport(null)

//     } finally {
//       setLoading(false)
//     }
//   }


//   // Export CSV
//   const exportCSV = async () => {
//     if (!month) {
//       setError("Please select a month.")
//       return
//     }

//     try {
//       setError("")

//       await downloadMonthlyReportCSV(month)

//     } catch (error) {
//       console.error(error)

//       setError(
//         error.message || "Unable to download CSV report."
//       )
//     }
//   }


//   // Export Excel
//   const exportExcel = async () => {
//     if (!month) {
//       setError("Please select a month.")
//       return
//     }

//     try {
//       setError("")

//       await downloadMonthlyReportExcel(month)

//     } catch (error) {
//       console.error(error)

//       setError(
//         error.message || "Unable to download Excel report."
//       )
//     }
//   }


//   return (
//     <div className="p-6">

//       {/* Page Header */}
//       <div className="mb-6">

//         <h1 className="text-2xl font-bold">
//           Monthly Attendance Report
//         </h1>

//         <p className="text-gray-500 mt-1">
//           View and export employee attendance
//           for a selected month.
//         </p>

//       </div>


//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-5 mb-6">

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//           {/* Month */}
//           <div>

//             <label className="block text-sm font-medium mb-2">
//               Month
//             </label>

//             <input
//               type="month"
//               value={month}
//               onChange={(e) =>
//                 setMonth(e.target.value)
//               }
//               className="w-full border rounded-md px-3 py-2"
//             />

//           </div>

//         </div>


//         {/* Buttons */}
//         <div className="flex flex-wrap gap-3 mt-5">

//           <button
//             onClick={generateReport}
//             disabled={loading}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
//           >
//             {loading
//               ? "Generating..."
//               : "Generate Report"}
//           </button>


//           <button
//             onClick={exportCSV}
//             className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
//           >
//             Export CSV
//           </button>


//           <button
//             onClick={exportExcel}
//             className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800"
//           >
//             Export Excel
//           </button>

//         </div>


//         {/* Error */}
//         {error && (
//           <p className="text-red-600 mt-3">
//             {error}
//           </p>
//         )}

//       </div>


//       {/* Report */}
//       {report && (
//         <>

//           {/* Monthly Summary */}
//           <div className="bg-white rounded-lg shadow mb-6">

//             <div className="p-5 border-b">

//               <h2 className="text-lg font-semibold">
//                 Monthly Summary
//               </h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 {report.month}
//               </p>

//             </div>


//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead className="bg-gray-100">

//                   <tr>

//                     <th className="px-4 py-3 text-left">
//                       Employee
//                     </th>

//                     <th className="px-4 py-3 text-left">
//                       UID
//                     </th>

//                     <th className="px-4 py-3 text-left">
//                       Department
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Present Days
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Check-ins
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Check-outs
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Missing Check-out
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Total Hours
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Average Hours
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {!report.monthly_summary ||
//                   report.monthly_summary.length === 0 ? (

//                     <tr>

//                       <td
//                         colSpan="9"
//                         className="text-center py-6 text-gray-500"
//                       >
//                         No attendance data found.
//                       </td>

//                     </tr>

//                   ) : (

//                     report.monthly_summary.map(
//                       (employee) => (

//                         <tr
//                           key={employee.uid}
//                           className="border-t hover:bg-gray-50"
//                         >

//                           <td className="px-4 py-3">
//                             {employee.employee_name}
//                           </td>

//                           <td className="px-4 py-3">
//                             {employee.uid}
//                           </td>

//                           <td className="px-4 py-3">
//                             {employee.department}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {employee.present_days}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {employee.total_check_ins}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {employee.total_check_outs}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {employee.missing_check_out}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {employee.total_hours}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {employee.average_hours}
//                           </td>

//                         </tr>

//                       )
//                     )

//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>


//           {/* Daily Details */}
//           <div className="bg-white rounded-lg shadow">

//             <div className="p-5 border-b">

//               <h2 className="text-lg font-semibold">
//                 Daily Details
//               </h2>

//             </div>


//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead className="bg-gray-100">

//                   <tr>

//                     <th className="px-4 py-3 text-left">
//                       Date
//                     </th>

//                     <th className="px-4 py-3 text-left">
//                       UID
//                     </th>

//                     <th className="px-4 py-3 text-left">
//                       Employee
//                     </th>

//                     <th className="px-4 py-3 text-left">
//                       Department
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Check In
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Check Out
//                     </th>

//                     <th className="px-4 py-3 text-center">
//                       Hours Worked
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {!report.daily_details ||
//                   report.daily_details.length === 0 ? (

//                     <tr>

//                       <td
//                         colSpan="7"
//                         className="text-center py-6 text-gray-500"
//                       >
//                         No daily attendance found.
//                       </td>

//                     </tr>

//                   ) : (

//                     report.daily_details.map(
//                       (attendance, index) => (

//                         <tr
//                           key={`${attendance.uid}-${attendance.date}-${index}`}
//                           className="border-t hover:bg-gray-50"
//                         >

//                           <td className="px-4 py-3">
//                             {attendance.date}
//                           </td>

//                           <td className="px-4 py-3">
//                             {attendance.uid}
//                           </td>

//                           <td className="px-4 py-3">
//                             {attendance.employee_name}
//                           </td>

//                           <td className="px-4 py-3">
//                             {attendance.department}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {attendance.check_in || "-"}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {attendance.check_out || "-"}
//                           </td>

//                           <td className="px-4 py-3 text-center">
//                             {attendance.hours_worked || "-"}
//                           </td>

//                         </tr>

//                       )
//                     )

//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         </>

//       )}

//     </div>
//   )
// }


// export default MonthlyReports













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
                  <th>UID</th>
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
                    <tr key={employee.uid}>
                      <td>{employee.employee_name}</td>
                      <td>{employee.uid}</td>
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
                  <th>UID</th>
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
                    <tr key={`${record.uid}-${record.date}-${index}`}>
                      <td>{record.date}</td>
                      <td>{record.uid}</td>
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