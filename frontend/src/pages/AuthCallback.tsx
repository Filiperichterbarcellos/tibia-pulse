import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchSession } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/useAuthStore'
import { setAuthHeader } from '@/lib/apiClient'

export default function AuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const logout = useAuthStore((s) => s.logout)
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [message, setMessage] = useState('Finalizando login…')
  const processedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Token não recebido. Tente entrar novamente.')
      processedTokenRef.current = null
      return
    }

    if (processedTokenRef.current === token) {
      return
    }
    processedTokenRef.current = token

    async function finalize() {
      try {
        setAuthHeader(token)
        const { user } = await fetchSession()
        if (!user) throw new Error('user-missing')
        setSession({ token, user })
        navigate('/account', { replace: true })
      } catch (err: any) {
        console.error('[auth] callback failed', err)
        processedTokenRef.current = null
        logout()
        setStatus('error')
        setMessage(err?.response?.data?.error ?? 'Não foi possível validar sua sessão.')
      }
    }

    finalize()
  }, [location.search, navigate, setSession, logout])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-lg font-semibold text-white">
          {status === 'loading' ? 'Entrando…' : 'Ops, algo deu errado'}
        </p>
        <p className="mt-2 text-sm text-white/70">{message}</p>
        {status === 'error' && (
          <button
            type="button"
            className="mt-6 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            onClick={() => navigate('/login', { replace: true })}
          >
            Voltar para o login
          </button>
        )}
      </div>
    </div>
  )
}
