import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/apiClient'

type ApiWorld = {
  name: string
  pvp_type?: string
  pvpType?: string
  players_online?: number
  location?: string
  battleye_status?: string
  battleye?: string
  is_premium_only?: boolean
  isPremiumOnly?: boolean
}

type World = {
  name: string
  pvp: string
  online: number
  location: string
  battleye: string
  premium: boolean
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
        const { data } = await apiClient.get<{ worlds: ApiWorld[] }>('/api/worlds')
        if (!mounted) return
        const normalized =
          data?.worlds?.map((world) => ({
            name: world.name,
            pvp: world.pvp_type ?? world.pvpType ?? '-',
            online: Number(world.players_online ?? 0),
            location: (world.location ?? '').toString(),
            battleye: (world.battleye_status ?? world.battleye ?? '').toString(),
            premium: Boolean(world.is_premium_only ?? world.isPremiumOnly),
          })) ?? []
        setWorlds(normalized)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.response?.data?.error ?? 'upstream error')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const totalOnline = useMemo(
    () => worlds.reduce((sum, w) => sum + (Number.isFinite(w.online) ? w.online : 0), 0),
    [worlds],
  )

  if (loading) return <div className="retro-layout retro-panel">Carregando mundos…</div>
  if (error) return <div className="retro-layout retro-panel text-red-600">{error}</div>

  return (
    <div className="retro-layout space-y-6">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Worlds</p>
          <h1>Status dos servidores</h1>
          <p>Dados diretamente do TibiaData. Veja PvP, localização e número de jogadores online.</p>
        </div>
        <div className="retro-hero__box">
          <p>Total online agora</p>
          <strong style={{ fontSize: '1.5rem' }}>{totalOnline.toLocaleString('pt-BR')} players</strong>
        </div>
      </section>

      <section className="retro-panel overflow-x-auto">
        <table className="min-w-full text-sm text-slate-800">
          <thead>
            <tr className="text-left text-slate-500 uppercase tracking-wider text-xs">
              <th className="pb-2">Nome</th>
              <th className="pb-2">PvP</th>
              <th className="pb-2">Online</th>
              <th className="pb-2">Local</th>
              <th className="pb-2">BattlEye</th>
              <th className="pb-2">Premium</th>
            </tr>
          </thead>
          <tbody>
            {worlds.map((world) => (
              <tr
                key={world.name}
                className="border-t border-slate-200 bg-white text-slate-900 even:bg-slate-50"
              >
                <td className="py-2 font-semibold">{world.name}</td>
                <td className="py-2 capitalize">{world.pvp}</td>
                <td className="py-2">{world.online.toLocaleString('pt-BR')}</td>
                <td className="py-2">{world.location || '-'}</td>
                <td className="py-2">{formatBattleye(world.battleye)}</td>
                <td className="py-2">{world.premium ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function formatBattleye(value?: string) {
  if (!value) return '—'
  const lowered = value.toLowerCase()
  if (lowered.includes('protected') || lowered === 'on') return 'Green'
  if (lowered.includes('unprotected') || lowered === 'off') return 'Yellow'
  return value
}
