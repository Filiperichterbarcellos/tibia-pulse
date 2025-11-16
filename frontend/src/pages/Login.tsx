import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { API_BASE_URL } from '@/lib/apiClient'

type Props = { variant?: 'login' | 'register' }

const PROVIDERS = [
  {
    id: 'google',
    label: 'Continuar com Google',
    helper: 'Usa somente seu nome e e-mail do Google.',
  },
]

const ERROR_MESSAGES: Record<string, string> = {
  'config-error': 'Configuração ausente. Avise o administrador.',
  'invalid-state': 'Sessão expirada. Tente novamente.',
  'google-auth-failed': 'Não foi possível autenticar com o Google.',
}

export default function Login({ variant = 'login' }: Props) {
  const location = useLocation()
  const errorParam = useMemo(() => new URLSearchParams(location.search).get('error'), [location.search])
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] || 'Não foi possível iniciar sua sessão.' : null

  const title = variant === 'login' ? 'Entrar no Tibia Pulse' : 'Crie sua conta gratuita'
  const subtitle =
    variant === 'login'
      ? 'Acesse com sua conta Google. Não pedimos senha nem confirmação por e-mail.'
      : 'A conta é criada automaticamente ao autenticar com o Google.'

  const startOAuth = (provider: string) => {
    window.location.href = `${API_BASE_URL}/api/auth/${provider}`
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-white/60">{subtitle}</p>

        <div className="mt-8 space-y-4">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className="flex w-full flex-col rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-left transition hover:border-emerald-400/60"
              onClick={() => startOAuth(provider.id)}
            >
              <span className="text-base font-semibold text-white">{provider.label}</span>
              <span className="text-xs text-white/60">{provider.helper}</span>
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/60">
          <p className="font-semibold text-white">Como usamos seus dados?</p>
          <p>
            Apenas lemos nome, e-mail e avatar fornecidos pelo Google ou Discord para identificar você no Tibia Pulse.
            Você pode remover o acesso a qualquer momento diretamente no provedor.
          </p>
        </div>
      </div>
    </div>
  )
}
