import clsx from 'clsx'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/useAuthStore'
import logo from '@/assets/logo.png'

const NAV_LINKS = [
  { to: '/characters', label: 'Personagens' },
  { to: '/bazaar', label: 'Char Bazaar' },
  { to: '/bosses', label: 'Bosses' },
  { to: '/calculator', label: 'Calculadoras' },
  { to: '/worlds', label: 'Worlds' },
  { to: '/blog', label: 'Blog' },
  { to: '/favorites', label: 'Favoritos' },
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
            <button
              className="retro-auth retro-auth--ghost"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Sair
            </button>
          ) : (
            <>
              <Link to="/login" className="retro-auth retro-auth--ghost">Entrar</Link>
              <Link to="/register" className="retro-auth">Criar conta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
