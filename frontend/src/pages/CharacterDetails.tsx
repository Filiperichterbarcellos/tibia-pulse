import Container from '@/components/Container'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCharacter, type CharacterSummary } from '@/features/characters/api'

export default function CharacterDetails() {
  const { name = '' } = useParams()
  const [data, setData] = useState<CharacterSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function run() {
      setLoading(true); setError(null)
      try {
        const res = await getCharacter(name)
        if (!active) return
        setData(res.character)
      } catch (err: any) {
        if (!active) return
        setError(err?.response?.data?.error || 'Não encontrado')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (name) run()
    return () => { active = false }
  }, [name])

  return (
    <Container>
      <h1 className="text-xl font-semibold mb-3">Detalhes do personagem</h1>

      {loading && <div className="card p-4">Carregando…</div>}
      {error && !loading && <div className="card p-4 text-rose-300">{error}</div>}
      {data && !loading && (
        <div className="card p-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{data.name}</h2>
            <span className="badge">Level {data.level}</span>
            {data.vocation && <span className="badge">{data.vocation}</span>}
            {data.world && <span className="badge">{data.world}</span>}
          </div>

          <ul className="text-sm text-white/80 space-y-1">
            {data.residence && <li>Residência: {data.residence}</li>}
            {data.sex && <li>Sexo: {data.sex}</li>}
            {data.lastLogin && <li>Último login: {new Date(data.lastLogin).toLocaleString()}</li>}
            {data.created && <li>Criado em: {new Date(data.created).toLocaleDateString()}</li>}
          </ul>

          {data.deaths && data.deaths.length > 0 && (
            <div className="pt-2">
              <h3 className="font-medium mb-1">Mortes recentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-white/70">
                    <tr className="text-left">
                      <th className="py-1 pr-3">Data</th>
                      <th className="py-1 pr-3">Level</th>
                      <th className="py-1">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/90">
                    {data.deaths.slice(0, 10).map((d, i) => (
                      <tr key={i} className="border-t border-white/10">
                        <td className="py-1 pr-3">{new Date(d.time).toLocaleString()}</td>
                        <td className="py-1 pr-3">{d.level}</td>
                        <td className="py-1">{d.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  )
}
