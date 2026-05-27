import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/install', label: 'Install', icon: '⬇︎' },
  { path: '/network', label: 'Network Status', icon: '📶' },
  { path: '/offline', label: 'Offline Support', icon: '✈️' },
  { path: '/sw-update', label: 'SW Update', icon: '🔄' },
]

export default function Menu() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  return (
    <>
      <header className="app-header">
        <button
          className={`hamburger${open ? ' is-open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
        <span className="app-title">PWA Demo</span>
      </header>

      {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}

      <nav className={`app-nav${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <ul>
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
