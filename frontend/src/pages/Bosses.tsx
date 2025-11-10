import { useEffect, useMemo, useState } from 'react'
import { fetchBoostedBoss } from '@/features/bosses/api'
import BossCard from '@/features/bosses/BossCard'
import BossModal from '@/features/bosses/BossModal'
import { BOSSES, type BossEntry } from '@/features/bosses/bossesData'
import { listWorldNames } from '@/features/worlds/api'

export default function Bosses() {
  const [worlds, setWorlds] = useState<string[]>([])
  const [selectedWorld, setSelectedWorld] = useState('Antica')
  const [boosted, setBoosted] = useState<{ name: string; imageUrl?: string | null } | null>(null)
  const [query, setQuery] = useState('')
  const [modalBoss, setModalBoss] = useState<BossEntry | null>(null)

  useEffect(() => {
    listWorldNames()
      .then((names) => {
        setWorlds(names)
        if (names.length && !names.includes(selectedWorld)) {
          setSelectedWorld(names[0])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchBoostedBoss().then((data) => setBoosted(data))
  }, [])

  const recent = useMemo(
    () =>
      BOSSES.slice()
        .sort((a, b) => (a.respawn?.min ?? 99) - (b.respawn?.min ?? 99))
        .slice(0, 10),
    [],
  )

  const filteredBosses = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return BOSSES
    return BOSSES.filter((boss) => boss.name.toLowerCase().includes(term))
  }, [query])

  return (
    <div className="retro-layout space-y-8">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Boss tracker</p>
          <h1>Bosses monitorados por mundo</h1>
          <p>
            Filtros simples com dados do TibiaData. Veja o boost do dia e as estatísticas de kill
            para cada servidor, com links rápidos para o mapa do TibiaMaps.
          </p>
        </div>
        <div className="retro-hero__box">
          <p>Boosted hoje</p>
          {boosted ? (
            <div className="flex items-center gap-3">
              {boosted.imageUrl && (
                <img src={boosted.imageUrl} alt={boosted.name} width={48} height={48} />
              )}
              <div>
                <strong>{boosted.name}</strong>
                <p className="text-slate-700 text-sm">Aproveite o bônus extra</p>
              </div>
            </div>
          ) : (
            <span className="retro-hero__loading">Aguardando dados…</span>
          )}
        </div>
      </section>

      <section className="retro-panel space-y-4">
        <label className="retro-input">
          <span>Mundo atual</span>
          <div className="retro-input__field">
            <select value={selectedWorld} onChange={(e) => setSelectedWorld(e.target.value)}>
              {worlds.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="retro-input">
          <span>Buscar boss</span>
          <div className="retro-input__field">
            <input
              type="text"
              placeholder="Ex.: Shlorg, The Welter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </label>
      </section>

      <div className="grid gap-6 lg:grid-cols-4">
        <section className="lg:col-span-1 retro-panel space-y-4">
          <p className="filter-label">Recentemente rastreados</p>
          <div className="grid gap-3">
            {recent.map((entry) => (
              <button
                key={entry.name}
                type="button"
                className="text-left rounded-2xl border border-slate-200 px-3 py-2 hover:border-indigo-300"
                onClick={() => setModalBoss(entry)}
              >
                <p className="font-semibold text-slate-900">{entry.name}</p>
                <small className="text-slate-500">{formatRespawn(entry)}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="lg:col-span-3 retro-panel space-y-4">
          <p className="filter-label">Todos os bosses</p>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBosses.map((entry) => (
              <BossCard key={entry.name} entry={entry} onSelect={setModalBoss} />
            ))}
          </div>
        </section>
      </div>

      {modalBoss && (
        <BossModal entry={modalBoss} onClose={() => setModalBoss(null)} />
      )}
    </div>
  )
}

function formatRespawn(entry: BossEntry) {
  if (!entry.respawn) return 'Respawn desconhecido'
  const { min, max } = entry.respawn
  if (min === max) return `${min} dias`
  return `${min}-${max} dias`
}
