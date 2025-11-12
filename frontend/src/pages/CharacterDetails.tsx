import clsx from 'clsx'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { getCharacter, type CharacterSummary } from '@/features/characters/api'

type TabId = 'character' | 'history' | 'experience' | 'time' | 'highscore' | 'deaths'

export default function CharacterDetails() {
  const { name = '' } = useParams()
  const [data, setData] = useState<CharacterSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('character')

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

  const trackerStats = data?.trackerStats
  const xpHistory = trackerStats?.history ?? data?.history ?? []
  const levelHistory = trackerStats?.levelHistory ?? []
  const timeOnline = trackerStats?.timeOnline
  const highscores = trackerStats?.highscores ?? []
  const guildDeaths = trackerStats?.guildDeaths ?? []
  const deathsCount = data?.deaths?.length ?? 0

  const tabs = useMemo(
    () => [
      { id: 'character' as TabId, label: 'Character', enabled: true },
      { id: 'history' as TabId, label: 'History', enabled: levelHistory.length > 0 },
      {
        id: 'experience' as TabId,
        label: 'Experience',
        enabled: xpHistory.length > 0 || Boolean(data?.currentXP),
      },
      { id: 'time' as TabId, label: 'Tempo online', enabled: Boolean(timeOnline) },
      { id: 'highscore' as TabId, label: 'Highscore', enabled: highscores.length > 0 },
      {
        id: 'deaths' as TabId,
        label: 'Mortes',
        enabled: deathsCount > 0 || guildDeaths.length > 0,
      },
    ],
    [
      data?.currentXP,
      deathsCount,
      guildDeaths.length,
      highscores.length,
      levelHistory.length,
      timeOnline,
      xpHistory.length,
    ],
  )

  useEffect(() => {
    const current = tabs.find((tab) => tab.id === activeTab)
    if (!current || !current.enabled) {
      const fallback = tabs.find((tab) => tab.enabled)
      if (fallback && fallback.id !== activeTab) {
        setActiveTab(fallback.id)
      }
    }
  }, [tabs, activeTab])

  const renderTabContent = () => {
    if (!data) return null

    switch (activeTab) {
      case 'history':
        return (
          <div className="space-y-6">
            <section className="retro-panel space-y-3">
              <header>
                <h2 className="text-lg font-semibold text-slate-900">Histórico de levels</h2>
                <p className="text-sm text-slate-500">
                  Últimos registros capturados pelo nosso rastreador de progresso.
                </p>
              </header>
              {levelHistory.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-900">
                    <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 pr-3">Quando</th>
                        <th className="py-2 pr-3">Há quanto tempo</th>
                        <th className="py-2 pr-3">Level</th>
                        <th className="py-2">Mudança</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levelHistory.slice(0, 40).map((entry) => (
                        <tr key={`${entry.index}-${entry.level}`} className="border-t border-slate-100">
                          <td className="py-2 pr-3">{entry.index}</td>
                          <td className="py-2 pr-3">{formatDate(entry.when, false)}</td>
                          <td className="py-2 pr-3 text-slate-500 text-xs">{entry.relative ?? '—'}</td>
                          <td className="py-2 pr-3 font-semibold">{entry.level}</td>
                          <td className="py-2">{formatLevelChange(entry.change)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sem histórico disponível.</p>
              )}
            </section>
          </div>
        )
      case 'experience':
        return (
          <div className="space-y-6">
            <section className="retro-panel space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Resumo de experiência</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  label="Média diária (rastreador)"
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
            </section>
            <section className="retro-panel space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Variação diária</h2>
              {xpHistory.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-900">
                    <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="py-2 pr-3">Data</th>
                        <th className="py-2 pr-3">XP ganho</th>
                        <th className="py-2 pr-3">Rank vocação</th>
                        <th className="py-2 pr-3">Level</th>
                        <th className="py-2 pr-3">XP total</th>
                        <th className="py-2 pr-3">Tempo online</th>
                        <th className="py-2">XP / hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {xpHistory.slice(0, 35).map((entry) => (
                        <tr
                          key={`${entry.date}-${entry.level}-${entry.expChange}`}
                          className="border-t border-slate-100"
                        >
                          <td className="py-2 pr-3">{formatDate(entry.date, true)}</td>
                          <td className="py-2 pr-3 font-medium">
                            {formatSignedNumber(entry.expChange)}
                          </td>
                          <td className="py-2 pr-3">{formatRank(entry.vocationRank, entry.vocationRankDelta)}</td>
                          <td className="py-2 pr-3">{entry.level}</td>
                          <td className="py-2 pr-3">{formatNumber(entry.experience)}</td>
                          <td className="py-2 pr-3">
                            {formatDuration(entry.timeOnlineMinutes, entry.timeOnlineText)}
                          </td>
                          <td className="py-2">{formatNumber(entry.averageExpPerHour)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sem registros de experiência.</p>
              )}
            </section>
          </div>
        )
      case 'time':
        return (
          <div className="space-y-6">
            <section className="retro-panel space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Tempo online</h2>
              {timeOnline ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Stat label="Último mês" value={timeOnline.lastMonth ?? '—'} subtle />
                    <Stat label="Mês atual" value={timeOnline.currentMonth ?? '—'} subtle />
                    <Stat label="Semana atual" value={timeOnline.currentWeek ?? '—'} subtle />
                  </div>
                  {timeOnline.weekdays && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {timeOnline.weekdays.map((day) => (
                        <div
                          key={day.label}
                          className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-inner"
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-500">{day.label}</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {day.raw ?? formatDuration(day.durationMinutes)}
                          </p>
                          {day.doubleEvent && (
                            <p className="text-xs font-semibold text-amber-600">Double XP ativo</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">Sem informações registradas.</p>
              )}
            </section>
          </div>
        )
      case 'highscore':
        return (
          <div className="space-y-6">
            <section className="retro-panel space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Highscore</h2>
              {highscores.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-900">
                    <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="py-2 pr-3">Skill</th>
                        <th className="py-2 pr-3">Valor</th>
                        <th className="py-2">Posição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highscores.map((entry) => (
                        <tr key={`${entry.skill}-${entry.position}`} className="border-t border-slate-100">
                          <td className="py-2 pr-3 font-medium">{entry.skill}</td>
                          <td className="py-2 pr-3">{entry.value}</td>
                          <td className="py-2">
                            {entry.link ? (
                              <a
                                href={entry.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:underline"
                              >
                                {entry.position ?? 'Ver'}
                              </a>
                            ) : (
                              entry.position ?? '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sem dados de ranking para este personagem.</p>
              )}
            </section>
          </div>
        )
      case 'deaths': {
        const hasTrackerDeaths = guildDeaths.length > 0
        return (
          <div className="space-y-6">
            <section className="retro-panel space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Mortes recentes (tibia.com)</h2>
              {deathsCount ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-900">
                    <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
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
            <section className="retro-panel space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Histórico do rastreador</h2>
              {hasTrackerDeaths ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-900">
                    <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 pr-3">Quando</th>
                        <th className="py-2 pr-3">Assassino</th>
                        <th className="py-2 pr-3">Level</th>
                        <th className="py-2">XP perdida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guildDeaths.slice(0, 25).map((death) => (
                        <tr key={`${death.index}-${death.when}`} className="border-t border-slate-100">
                          <td className="py-2 pr-3">{death.index}</td>
                          <td className="py-2 pr-3">{formatDate(death.when, false)}</td>
                          <td className="py-2 pr-3">{death.killer}</td>
                          <td className="py-2 pr-3">{death.level}</td>
                          <td className="py-2">{formatSignedNumber(death.expLost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sem histórico adicional disponível.</p>
              )}
            </section>
          </div>
        )
      }
      case 'character':
      default:
        return (
          <div className="space-y-6">
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
                        Progresso atual no nível {data.level} e estimativas do rastreador.
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
                      label="Média diária (rastreador)"
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
          </div>
        )
    }
  }

  return (
    <div className="retro-layout space-y-6">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Perfil completo</p>
          <h1>{name}</h1>
          <p>
            Dados combinados do TibiaData, tibia.com e do nosso rastreador com histórico de XP, progresso até
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
          <section className="retro-panel">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  disabled={!tab.enabled}
                  onClick={() => tab.enabled && setActiveTab(tab.id)}
                  className={clsx(
                    'px-4 py-2 text-sm font-semibold rounded-full border transition-colors',
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100',
                    !tab.enabled && 'cursor-not-allowed opacity-40 hover:bg-white',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {renderTabContent()}
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

function formatRank(rank?: number, delta?: number) {
  if (typeof rank !== 'number' || Number.isNaN(rank)) return '—'
  if (!delta) return `${rank}`
  const signal = delta > 0 ? '+' : ''
  return `${rank} (${signal}${delta})`
}

function formatDuration(minutes?: number, fallback?: string) {
  if (typeof minutes === 'number' && Number.isFinite(minutes)) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours && mins) return `${hours}h ${mins}min`
    if (hours) return `${hours}h`
    if (mins) return `${mins}min`
  }
  return fallback ?? '—'
}

function formatLevelChange(change?: 'up' | 'down' | 'same') {
  if (change === 'up') return <span className="text-emerald-600 font-semibold">Level up</span>
  if (change === 'down') return <span className="text-red-600 font-semibold">Level down</span>
  return <span className="text-slate-500">—</span>
}
