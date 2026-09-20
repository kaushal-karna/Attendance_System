const MENU_ITEMS = [
  "Dashboard",
  "Employees",
  "Departments",
  "Attendance",
  "Monthly Reports",
]

function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Attendance</h2>
        <span>Management System</span>
      </div>

      <nav aria-label="Main">
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            aria-current={currentPage === item ? "page" : undefined}
            className={
              currentPage === item ? "nav-item active" : "nav-item"
            }
            onClick={() => setCurrentPage(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar