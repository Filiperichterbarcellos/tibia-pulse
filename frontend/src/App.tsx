import { Routes, Route, NavLink } from 'react-router-dom'
import Bazaar from './pages/Bazaar'
import Character from './pages/Character'
import Worlds from './pages/Worlds'
import Login from './pages/Login'
import Register from './pages/Register'
import { Sword, User, Globe2, ShoppingBag, Flame } from 'lucide-react'
import { ThemeToggle } from './components/ThemeToggle'
import QuickSearch from './components/QuickSearch'

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Flame className="size-6 text-brand-600" />
            <span className="font-semibold text-lg">Tibia Pulse</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            <TopLink to="/" icon={<ShoppingBag className="size-4" />} label="Bazar" />
            <TopLink to="/worlds" icon={<Globe2 className="size-4" />} label="Mundos" />
            <TopLink to="/login" icon={<User className="size-4" />} label="Entrar" />
          </nav>

          {/* Busca rápida na navbar */}
          <div className="ml-auto mr-2 w-64 max-w-[40%] hidden sm:block">
            <QuickSearch />
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          {/* Home agora é o Bazar */}
          <Route path="/" element={<Bazaar />} />
          <Route path="/character/:name" element={<Character />} />
          <Route path="/worlds" element={<Worlds />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Fallback 404 amigável */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="border-t border-zinc-200/70 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-zinc-500 text-center">
          © {new Date().getFullYear()} Tibia Pulse — inspirado no Exevo Pan (React + Vite + Tailwind).
        </div>
      </footer>
    </div>
  )
}

function TopLink({ to, icon, label }:{ to:string, icon:React.ReactNode, label:string }) {
  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        [
          "px-3 py-2 rounded-xl text-sm font-medium transition",
          isActive
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        ].join(" ")
      }
    >
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
    </NavLink>
  )
}

function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-2">Página não encontrada</h1>
      <p className="text-zinc-500">Verifique o endereço ou volte para o <NavLink to="/" className="underline">Bazar</NavLink>.</p>
    </div>
  )
}
