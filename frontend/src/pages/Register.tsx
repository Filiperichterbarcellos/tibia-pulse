import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/useAuthStore'

type RegisterPayload = { name: string; email: string; password: string }

export default function Register() {
  const [form, setForm] = useState<RegisterPayload>({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await register(form)
      if (!data?.token) {
        setError('Não foi possível criar sua conta, tente novamente.')
        return
      }
      setSession({ token: data.token, user: data.user })
      navigate('/', { replace: true })
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Falha ao registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">Criar conta</h1>
        <p className="text-sm text-white/60">Acompanhe o bazar e salve personagens favoritos.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 inline-block text-white/70">Nome</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Opcional"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 inline-block text-white/70">E-mail</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 inline-block text-white/70">Senha</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
          </label>

          {error && <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button
            className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Criando…' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          Já tem conta?{' '}
          <Link to="/login" className="text-emerald-300 underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
