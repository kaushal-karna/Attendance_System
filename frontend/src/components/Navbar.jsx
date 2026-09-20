function Navbar({ currentPage }) {
  return (
    <header className="navbar">
      <div>
        <h1>{currentPage}</h1>
      </div>

      <div className="navbar-user">
        <span>Admin</span>
      </div>
    </header>
  )
}

export default Navbar