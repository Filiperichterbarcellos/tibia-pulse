import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/useAuthStore'

export default function Header() {
  const navigate = useNavigate()
  const { token, logout } = useAuthStore()
  const isActive = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-xl ${isActive ? 'bg-white/15' : 'hover:bg-white/10'}`

  return (
    <header className="border-b border-white/10 bg-white/5 sticky top-0 backdrop-blur z-50">
      <div className="container-pad flex items-center gap-4 h-14">
        <Link to="/" className="font-semibold tracking-wide">Tibia Pulse</Link>

        <nav className="flex items-center gap-2 text-sm">
          <NavLink to="/characters" className={isActive}>Personagens</NavLink>
          <NavLink to="/bazaar" className={isActive}>Bazaar</NavLink>
          <NavLink to="/bosses" className={isActive}>Bosses</NavLink>
          <NavLink to="/worlds" className={isActive}>Mundos</NavLink>
          <NavLink to="/calculator" className={isActive}>Calculadora</NavLink>
          <NavLink to="/blog" className={isActive}>Guia</NavLink>
          <NavLink to="/favorites" className={isActive}>Favoritos</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {token ? (
            <button
              className="btn"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Sair
            </button>
          ) : (
            <>
              <Link to="/login" className="btn">Entrar</Link>
              <Link to="/register" className="btn">Criar conta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
