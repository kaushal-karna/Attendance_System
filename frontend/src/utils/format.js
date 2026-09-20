// Local "YYYY-MM-DD" for today.
// new Date().toISOString() returns UTC, which is the *previous* day
// in Nepal (UTC+05:45) between midnight and 05:45 local time.
export function getLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Local "YYYY-MM" for the month input.
export function getLocalMonth(date = new Date()) {
  return getLocalDate(date).slice(0, 7)
}

// Numbers coming back from DRF may be strings ("7.50") or null.
export function formatNumber(value, fallback = "0") {
  if (value === null || value === undefined || value === "") {
    return fallback
  }

  const number = Number(value)

  return Number.isNaN(number) ? String(value) : String(number)
}