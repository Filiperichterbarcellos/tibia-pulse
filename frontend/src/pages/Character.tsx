import { useState } from 'react'
import { api } from '@/lib/base'

type CharacterSummary = {
  name: string
  level: number
  vocation?: string
  world?: string
  lastLogin?: string
}

export default function Character() {
  const [name, setName] = useState('')
  const [data, setData] = useState<CharacterSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const { data } = await api.get<{ character: CharacterSummary }>(
        `/characters/${encodeURIComponent(name.trim())}`
      )
      setData(data?.character ?? null)
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Buscar personagem</h1>
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder="Ex.: Kaamez"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="px-4 py-2 rounded-lg border" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error && <div className="text-red-500">{error}</div>}

      {data && (
        <div className="rounded-xl border p-4">
          <div className="font-semibold text-lg">{data.name}</div>
          <div className="text-sm opacity-80">
            Level {data.level} • {data.vocation ?? '—'} • {data.world ?? '—'}
          </div>
          {data.lastLogin && (
            <div className="text-sm mt-1">
              Último login: {new Date(data.lastLogin).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
