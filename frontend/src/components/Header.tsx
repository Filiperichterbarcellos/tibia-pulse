import clsx from 'clsx'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/useAuthStore'
import logo from '@/assets/fansite-logo.png'

const NAV_LINKS = [
  { to: '/characters', label: 'Buscar personagem' },
  { to: '/bosses', label: 'Bosses' },
  { to: '/calculator', label: 'Calculadoras' },
  { to: '/worlds', label: 'Worlds' },
  { to: '/blog', label: 'Blog' },
]

export default function Header() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="retro-header">
      <div className="retro-header__inner">
        <Link to="/" className="retro-logo">
          <img src={logo} alt="Tibia Pulse" />
          <span>Tibia Pulse</span>
        </Link>

        <nav className="retro-nav">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => clsx('retro-nav-link', isActive && 'is-active')}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="retro-header__actions">
          {token ? (
            <>
              <Link to="/account" className="retro-auth retro-auth--ghost">Minha conta</Link>
              <button
                className="retro-auth retro-auth--ghost"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="retro-auth">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  )
}
