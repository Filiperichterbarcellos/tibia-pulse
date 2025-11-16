import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { API_BASE_URL } from '@/lib/apiClient'

type Props = { variant?: 'login' | 'register' }

const PROVIDERS = [
  {
    id: 'google',
    label: 'Continuar com Google',
    helper: 'Usa apenas nome e e-mail para identificar você no Tibia Pulse.',
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

  const title = variant === 'login' ? 'Entre com estilo retrô' : 'Crie sua conta gratuita'
  const subtitle =
    variant === 'login'
      ? 'Use sua conta Google para desbloquear os painéis personalizados, favoritos e rastreamento avançado.'
      : 'A conta é criada automaticamente ao autenticar com o Google.'

  const startOAuth = (provider: string) => {
    window.location.href = `${API_BASE_URL}/api/auth/${provider}`
  }

  return (
    <div className="retro-login-wrapper">
      <section className="retro-hero retro-hero--login">
        <div>
          <p className="retro-badge shadow-lg">ÁREA EXCLUSIVA</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <ul className="retro-hero__box mt-6 text-white/90">
            <li>Favoritos sincronizados entre desktop e mobile</li>
            <li>Monitoramento rápido do seu personagem principal</li>
            <li>Integração direta com nosso rastreador de bosses</li>
          </ul>
        </div>
      </section>

      <section className="retro-panel retro-login-panel">
        <div className="space-y-4">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className="retro-login-button"
              onClick={() => startOAuth(provider.id)}
            >
              <div>
                <span>{provider.label}</span>
                <p>{provider.helper}</p>
              </div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 12h12M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="retro-login-alert" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="retro-login-info">
          <p>Como usamos seus dados?</p>
          <span>
            Apenas lemos nome, e-mail e avatar fornecidos pelo Google para personalizar sua experiência. Você pode remover o acesso direto nas preferências do Google.
          </span>
        </div>
      </section>
    </div>
  )
}
