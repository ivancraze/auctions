import { Link, Outlet } from '@tanstack/react-router'

export function RootLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-logo" search={{ page: 1 }} to="/auctions">
          Cargo Auctions
        </Link>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
