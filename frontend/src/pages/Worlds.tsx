import { useEffect, useState } from 'react'
import { api } from '@/lib/base'

type World = {
  name: string
  pvpType?: string
  online?: number
  location?: string
  isPremiumOnly?: boolean
}

export default function Worlds() {
  const [worlds, setWorlds] = useState<World[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        // ajuste o endpoint conforme teu backend: '/worlds' ou '/market/worlds'
        const { data } = await api.get<{ worlds: World[] }>('/worlds')
        if (!mounted) return
        setWorlds(data?.worlds ?? [])
      } catch (e: any) {
        if (!mounted) return
        setError(e?.response?.data?.error ?? 'upstream error')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-6">Carregando mundos…</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Worlds</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">PvP</th>
              <th className="py-2 pr-4">Online</th>
              <th className="py-2 pr-4">Local</th>
              <th className="py-2">Premium</th>
            </tr>
          </thead>
          <tbody>
            {worlds.map((w) => (
              <tr key={w.name} className="border-b">
                <td className="py-2 pr-4">{w.name}</td>
                <td className="py-2 pr-4">{w.pvpType ?? '-'}</td>
                <td className="py-2 pr-4">{w.online ?? '-'}</td>
                <td className="py-2 pr-4">{w.location ?? '-'}</td>
                <td className="py-2">{w.isPremiumOnly ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
