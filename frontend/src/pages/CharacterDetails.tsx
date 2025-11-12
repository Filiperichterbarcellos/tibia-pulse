import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
      setLoading(true)
      setError(null)
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
    return () => {
      active = false
    }
  }, [name])

  const xpInfo = useMemo(() => {
    if (!data?.currentXP) return null
    const levelFloor = xpForLevel(Math.max(1, data.level))
    const nextLevel = xpForLevel(Math.max(1, data.level + 1))
    const xpIntoLevel = Math.max(0, data.currentXP - levelFloor)
    const xpLevelSize = Math.max(1, nextLevel - levelFloor)
    const percent = Math.min(100, (xpIntoLevel / xpLevelSize) * 100)
    return { xpIntoLevel, xpLevelSize, percent }
  }, [data?.currentXP, data?.level])

  return (
    <div className="retro-layout space-y-6">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Perfil completo</p>
          <h1>{name}</h1>
          <p>
            Dados combinados do TibiaData, tibia.com e GuildStats com histórico de XP, progresso até
            o próximo level e todas as mortes recentes.
          </p>
        </div>
        {data?.currentXP && (
          <div className="retro-hero__box">
            <p>XP atual</p>
            <strong>{formatNumber(data.currentXP)}</strong>
            {typeof data.xpToNextLevel === 'number' && (
              <p className="text-sm text-slate-600">
                Faltam {formatNumber(data.xpToNextLevel)} XP para o nível {data.level + 1}
              </p>
            )}
          </div>
        )}
      </section>

      {loading && (
        <div className="retro-panel text-slate-700 font-medium">
          Carregando…
        </div>
      )}
      {error && !loading && <div className="retro-panel text-red-600">{error}</div>}

      {data && !loading && (
        <>
          <section className="retro-panel space-y-5">
            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="Level" value={data.level} />
              <Stat label="Vocação" value={data.vocation ?? '—'} />
              <Stat label="Mundo" value={data.world ?? '—'} />
              <Stat label="Status da conta" value={data.accountStatus ?? '—'} />
            </div>

            {data.currentXP && (
              <div className="space-y-3">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="filter-label mb-0">Experiência e progresso</p>
                    <p className="text-sm text-slate-600">
                      Progresso atual no nível {data.level} e estimativas da GuildStats.
                    </p>
                  </div>
                </header>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Level {data.level}</span>
                    <span>Level {data.level + 1}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-500 transition-[width] duration-500"
                      style={{ width: `${xpInfo?.percent ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Stat label="XP atual" value={formatNumber(data.currentXP)} subtle />
                  <Stat
                    label="XP para o próximo nível"
                    value={
                      typeof data.xpToNextLevel === 'number'
                        ? formatNumber(data.xpToNextLevel)
                        : xpInfo
                          ? formatNumber(xpInfo.xpLevelSize - xpInfo.xpIntoLevel)
                          : '—'
                    }
                    subtle
                  />
                  <Stat
                    label="Média diária (GuildStats)"
                    value={
                      typeof data.averageDailyXP === 'number'
                        ? formatNumber(data.averageDailyXP)
                        : '—'
                    }
                    subtle
                  />
                  <Stat
                    label="Melhor dia"
                    value={
                      data.bestDayXP
                        ? `${formatNumber(data.bestDayXP.value)} XP em ${formatDate(
                            data.bestDayXP.date,
                            true,
                          )}`
                        : '—'
                    }
                    subtle
                  />
                </div>
              </div>
            )}
          </section>

          <section className="retro-panel space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Detalhes gerais</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Residência" value={data.residence} />
              <Detail label="Guild" value={data.guild} />
              <Detail label="Sexo" value={data.sex} />
              <Detail label="Criado em" value={formatDate(data.created, true)} />
              <Detail label="Último login" value={formatDate(data.lastLogin, false)} />
              <Detail label="Casa" value={data.house} />
              <Detail label="Title" value={data.title} />
              <Detail label="Mundo anterior" value={data.formerWorld} />
              <Detail
                label="Achievement points"
                value={
                  typeof data.achievementPoints === 'number'
                    ? formatNumber(data.achievementPoints)
                    : undefined
                }
              />
              <Detail label="Former names" value={data.formerNames} />
            </dl>
            {data.comment && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="filter-label mb-1">Comentário</p>
                <p className="text-sm text-slate-800 whitespace-pre-line">{data.comment}</p>
              </div>
            )}
          </section>

          {data.history && data.history.length > 0 && (
            <section className="retro-panel space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Histórico de XP</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-500 uppercase tracking-wide text-xs">
                    <tr className="text-left">
                      <th className="py-2 pr-3">Data</th>
                      <th className="py-2 pr-3">Variação</th>
                      <th className="py-2">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.slice(0, 12).map((entry) => (
                      <tr key={`${entry.date}-${entry.level}`} className="border-t border-slate-100">
                        <td className="py-2 pr-3">{formatDate(entry.date, true)}</td>
                        <td className="py-2 pr-3 font-medium">
                          {formatSignedNumber(entry.expChange)}
                        </td>
                        <td className="py-2">{entry.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="retro-panel space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Mortes recentes</h2>
            {data.deaths.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-500 uppercase tracking-wide text-xs">
                    <tr className="text-left">
                      <th className="py-2 pr-3">Data</th>
                      <th className="py-2 pr-3">Level</th>
                      <th className="py-2">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deaths.slice(0, 15).map((d, index) => (
                      <tr key={`${d.time}-${index}`} className="border-t border-slate-100">
                        <td className="py-2 pr-3">{formatDate(d.time, false)}</td>
                        <td className="py-2 pr-3">{d.level ?? '—'}</td>
                        <td className="py-2">{d.reason ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sem mortes registradas recentemente.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, subtle }: { label: string; value: ReactNode; subtle?: boolean }) {
  return (
    <div className="stat-card" data-variant={subtle ? 'subtle' : undefined}>
      <p>{label}</p>
      <strong>{value ?? '—'}</strong>
    </div>
  )
}

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2 shadow-inner">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value ?? '—'}</p>
    </div>
  )
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

function formatNumber(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return numberFormatter.format(value)
}

function formatSignedNumber(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  const formatted = formatNumber(Math.abs(value))
  if (value === 0) return '0'
  return value > 0 ? `+${formatted}` : `-${formatted}`
}

function formatDate(value?: string | null, withDateOnly?: boolean) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return withDateOnly
    ? date.toLocaleDateString('pt-BR')
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function xpForLevel(level: number) {
  if (level <= 0) return 0
  return Math.floor((50 * (level ** 3 - 6 * level ** 2 + 17 * level - 12)) / 3)
}
