import { useState } from 'react'
import { api, setAuth } from '@/lib/base'

type RegisterPayload = { name: string; email: string; password: string }

export default function Register() {
  const [form, setForm] = useState<RegisterPayload>({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      // axios instance: url + body (sem terceiro argumento, a não ser que teu wrapper permita)
      const { data } = await api.post<{ token?: string; message?: string }>(
        '/auth/register',
        form
      )
      if (data?.token) setAuth(data.token)
      setSuccess(data?.message ?? 'Conta criada com sucesso!')
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Falha ao registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />

        <button className="px-4 py-2 rounded-lg border" disabled={loading}>
          {loading ? 'Enviando…' : 'Registrar'}
        </button>
      </form>

      {error && <div className="text-red-500 mt-3">{error}</div>}
      {success && <div className="text-green-600 mt-3">{success}</div>}
    </div>
  )
}
