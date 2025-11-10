// src/pages/Login.tsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/useAuthStore'

type LocationState = { from?: string }

export default function Login() {
  const nav = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const redirectTo = (location.state as LocationState)?.from || '/'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await login({ email, password })
      if (!data?.token) {
        setError('Credenciais inválidas.')
        return
      }
      setSession({ token: data.token, user: data.user })
      nav(redirectTo, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">Bem-vindo de volta</h1>
        <p className="text-sm text-white/60">Entre para salvar personagens favoritos no bazar.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 inline-block text-white/70">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 inline-block text-white/70">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </label>

          {error && <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          Não tem conta?{' '}
          <Link to="/register" className="text-emerald-300 underline">
            Criar agora
          </Link>
        </p>
      </div>
    </div>
  )
}
