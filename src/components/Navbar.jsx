import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from './Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

const menu = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/layanan', label: 'Layanan' },
  { to: '/tentang', label: 'Tentang' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const tutup = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={tutup}>
          <span className="navbar__logo">S</span>SampahPintar
        </Link>

        <button
          className="navbar__toggle"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <nav className={`navbar__menu${open ? ' navbar__menu--open' : ''}`}>
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} onClick={tutup}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
              {m.label}
            </NavLink>
          ))}
          {user ? (
            <div className="navbar__profil">
              <div className="navbar__avatar" aria-hidden="true">
                {user.nama.charAt(0).toUpperCase()}
              </div>
              <span className="navbar__profil-nama" title={user.nama}>
                {user.nama.split(' ')[0]}
              </span>
              <button
                type="button"
                className="navbar__keluar"
                onClick={() => { logout(); tutup() }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <Button to="/masuk" variant="outline" onClick={tutup}>Masuk</Button>
          )}
        </nav>
      </div>
    </header>
  )
}
