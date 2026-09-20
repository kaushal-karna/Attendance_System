// export function formatTime(timeString, format = "12h") {
//   if (!timeString) {
//     return "-"
//   }

//   // Remove microseconds if Django sends them
//   const cleanTime = timeString.split(".")[0]

//   const [hours, minutes, seconds] = cleanTime
//     .split(":")
//     .map(Number)

//   if (format === "24h") {
//     return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
//   }

//   const period = hours >= 12 ? "PM" : "AM"

//   const displayHours = hours % 12 || 12

//   return `${displayHours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${period}`
// }

















// Django's TimeField serializes as "15:04:55.318359" or "09:35:40".
// Trims microseconds and renders in 12h (AM/PM) or 24h format.
export function formatTime(timeString, format = "12h") {
  if (!timeString) {
    return "-"
  }

  const cleanTime = String(timeString).split(".")[0]
  const [hours, minutes, seconds = 0] = cleanTime.split(":").map(Number)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return "-"
  }

  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")

  if (format === "24h") {
    return `${String(hours).padStart(2, "0")}:${mm}:${ss}`
  }

  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12

  return `${displayHours}:${mm}:${ss} ${period}`
}