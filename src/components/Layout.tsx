import { Outlet } from 'react-router-dom'
import Menu from './Menu'

export default function Layout() {
  return (
    <div className="app-shell">
      <Menu />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
