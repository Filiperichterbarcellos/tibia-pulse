import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/features/auth/useAuthStore'

export default function App() {
  const token = useAuthStore((s) => s.token)
  const hydrateProfile = useAuthStore((s) => s.hydrateProfile)

  useEffect(() => {
    if (token) {
      hydrateProfile()
    }
  }, [token, hydrateProfile])

  return (
    <div className="min-h-dvh bg-[#f4f5fb] text-[#0f172a] flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
