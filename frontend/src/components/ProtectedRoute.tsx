import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/useAuthStore'

export default function ProtectedRoute() {
  const location = useLocation()
  const token = useAuthStore((s) => s.token)
  const status = useAuthStore((s) => s.status)

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (status === 'loading') {
    return (
      <div className="py-10 text-center text-sm text-zinc-400">
        Validando sua sessão…
      </div>
    )
  }

  return <Outlet />
}
