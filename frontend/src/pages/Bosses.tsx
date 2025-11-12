import { useEffect, useMemo, useRef, useState } from 'react'
import BossCard from '@/features/bosses/BossCard'
import BossModal from '@/features/bosses/BossModal'
import { BOSSES, type BossEntry } from '@/features/bosses/bossesData'
import { listWorldNames } from '@/features/worlds/api'
import { useFavorites, type FavoriteRecord } from '@/features/favorites/useFavorites'
import { useAuthStore } from '@/features/auth/useAuthStore'
import { getBossSprite } from '@/features/bosses/sprites'
import { fetchWorldKillStats, type KillStatsEntry, type KillStatsResponse } from '@/features/bosses/api'

export default function Bosses() {
  const [worlds, setWorlds] = useState<string[]>([])
  const [selectedWorld, setSelectedWorld] = useState('Antica')
  const [query, setQuery] = useState('')
  const [modalBoss, setModalBoss] = useState<BossEntry | null>(null)
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null)
  const [worldStats, setWorldStats] = useState<KillStatsResponse | null>(null)
  const [worldStatsLoading, setWorldStatsLoading] = useState(false)
  const [worldStatsError, setWorldStatsError] = useState<string | null>(null)
  const statsCache = useRef(new Map<string, KillStatsResponse | null>())

  type BossFavorite = FavoriteRecord<BossFavoriteSnapshot>
  const {
    favorites: bossFavorites,
    loading: favoritesLoading,
    error: favoritesError,
    addFavorite,
    removeFavorite,
    isFavorite,
    updatingKey: updatingFavoriteKey,
  } = useFavorites<BossFavoriteSnapshot>('BOSS')
  const token = useAuthStore((s) => s.token)

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
    let active = true
    async function load() {
      if (!selectedWorld) return
      setWorldStatsLoading(true)
      setWorldStatsError(null)
      if (statsCache.current.has(selectedWorld)) {
        setWorldStats(statsCache.current.get(selectedWorld) ?? null)
        setWorldStatsLoading(false)
        return
      }
      try {
        const data = await fetchWorldKillStats(selectedWorld)
        if (!active) return
        statsCache.current.set(selectedWorld, data)
        setWorldStats(data)
        if (!data) setWorldStatsError('Ainda não há registros recentes para este mundo.')
      } catch (err: any) {
        if (!active) return
        const message = err?.response?.data?.error ?? 'Não foi possível carregar os dados do mundo.'
        setWorldStats(null)
        setWorldStatsError(message)
      } finally {
        if (active) setWorldStatsLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [selectedWorld])

  useEffect(() => {
    if (!favoriteMessage) return
    const timeout = setTimeout(() => setFavoriteMessage(null), 4000)
    return () => clearTimeout(timeout)
  }, [favoriteMessage])

  const bossNameMap = useMemo(() => {
    const map = new Map<string, BossEntry>()
    BOSSES.forEach((boss) => {
      map.set(boss.name.toLowerCase(), boss)
    })
    return map
  }, [])

  const worldStatsMap = useMemo(() => {
    const map = new Map<string, KillStatsEntry>()
    if (worldStats?.entries) {
      worldStats.entries.forEach((entry) => {
        map.set(entry.race.toLowerCase(), entry)
      })
    }
    return map
  }, [worldStats])

  const recentTracked = useMemo(() => {
    if (worldStats?.entries?.length) {
      return worldStats.entries
        .filter((entry) => entry.last_day_killed > 0 || entry.last_week_killed > 0)
        .map((entry) => {
          const boss = bossNameMap.get(entry.race.toLowerCase())
          return boss ? { boss, stats: entry } : null
        })
        .filter((value): value is { boss: BossEntry; stats: KillStatsEntry } => Boolean(value))
        .sort((a, b) => b.stats.last_day_killed - a.stats.last_day_killed)
        .slice(0, 8)
    }
    const fallback = BOSSES.slice()
      .sort((a, b) => (a.respawn?.min ?? 99) - (b.respawn?.min ?? 99))
      .slice(0, 8)
    return fallback.map((boss) => ({ boss, stats: undefined }))
  }, [worldStats, bossNameMap])

  const filteredBosses = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return BOSSES
    return BOSSES.filter((boss) => boss.name.toLowerCase().includes(term))
  }, [query])

  const handleFavoriteToggle = async (entry: BossEntry) => {
    if (!token) {
      setFavoriteMessage('Entre para salvar bosses favoritos.')
      return
    }
    const current = isFavorite(entry.name)
    try {
      if (current) {
        await removeFavorite(current as BossFavorite)
      } else {
        await addFavorite({
          key: entry.name,
          snapshot: createFavoriteSnapshot(entry),
        })
      }
    } catch {
      setFavoriteMessage('Não foi possível atualizar seus favoritos agora.')
    }
  }

  const openFavorite = (fav: BossFavorite) => {
    const entry = BOSSES.find((boss) => boss.name === (fav.snapshot?.name ?? fav.key))
    if (entry) {
      setModalBoss(entry)
    }
  }

  return (
    <div className="retro-layout space-y-8">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Boss tracker</p>
          <h1>Bosses monitorados por mundo</h1>
          <p>
            Filtros simples com dados do TibiaData. Veja estatísticas de kill para cada servidor, com links rápidos para o mapa do TibiaMaps.
          </p>
        </div>
      </section>

      {favoriteMessage && (
        <div className="retro-panel border-amber-100 bg-amber-50 text-sm text-amber-900">
          {favoriteMessage}
        </div>
      )}

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
        <div className="text-xs text-slate-500">
          {worldStatsLoading && 'Carregando estatísticas do mundo...'}
          {!worldStatsLoading && worldStats && `Dados em tempo real de ${selectedWorld}`}
          {!worldStatsLoading && worldStatsError && (
            <span className="text-red-500">{worldStatsError}</span>
          )}
        </div>

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

      <section className="retro-panel space-y-3">
        <div className="flex items-center justify-between">
          <p className="filter-label">Meus bosses favoritos</p>
          {favoritesLoading && <span className="text-xs text-slate-500">Carregando…</span>}
        </div>
        {favoritesError && <p className="text-sm text-red-500">{favoritesError}</p>}
        {bossFavorites.length === 0 ? (
          <p className="text-sm text-slate-600">
            {token
              ? 'Você ainda não favoritou nenhum boss.'
              : 'Entre para salvar os bosses que pretende caçar.'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {bossFavorites.map((fav) => (
              <div
                key={fav.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => openFavorite(fav)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  {fav.snapshot?.sprite && (
                    <img
                      src={fav.snapshot.sprite}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full border border-slate-200 bg-slate-50"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{fav.snapshot?.name ?? fav.key}</p>
                    {fav.snapshot?.respawn && (
                      <p className="text-xs text-slate-500">{fav.snapshot.respawn}</p>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                  onClick={() => removeFavorite(fav)}
                  disabled={updatingFavoriteKey === fav.key}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-4">
        <section className="lg:col-span-1 retro-panel space-y-4">
          <p className="filter-label">
            Aparições recentes {worldStats ? `(${selectedWorld})` : '(destaques)'}
          </p>
          <div className="grid gap-3">
            {recentTracked.length === 0 && (
              <p className="text-sm text-slate-500">Sem registros recentes para este mundo.</p>
            )}
            {recentTracked.map(({ boss, stats }) => (
              <button
                key={boss.name}
                type="button"
                className="text-left rounded-2xl border border-slate-200 px-3 py-2 hover:border-indigo-300"
                onClick={() => setModalBoss(boss)}
              >
                <p className="font-semibold text-slate-900">{boss.name}</p>
                {stats ? (
                  <small className="text-slate-500">
                    {stats.last_day_killed > 0
                      ? `${stats.last_day_killed} mortes nas últimas 24h`
                      : `${stats.last_week_killed} mortes na última semana`}
                  </small>
                ) : (
                  <small className="text-slate-500">{formatRespawn(boss)}</small>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="lg:col-span-3 retro-panel space-y-4">
          <p className="filter-label">Todos os bosses</p>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBosses.map((entry) => {
              const favorite = isFavorite(entry.name)
              const stats = worldStatsMap.get(entry.name.toLowerCase())
              return (
                <BossCard
                  key={entry.name}
                  entry={entry}
                  onSelect={setModalBoss}
                  onToggleFavorite={handleFavoriteToggle}
                  isFavorite={Boolean(favorite)}
                  favoriteDisabled={updatingFavoriteKey === entry.name}
                  worldStats={stats}
                  worldName={selectedWorld}
                />
              )
            })}
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

type BossFavoriteSnapshot = {
  name: string
  sprite?: string | null
  respawn?: string
}

function createFavoriteSnapshot(entry: BossEntry): BossFavoriteSnapshot {
  return {
    name: entry.name,
    sprite: getBossSprite(entry.name) ?? undefined,
    respawn: formatRespawn(entry),
  }
}
