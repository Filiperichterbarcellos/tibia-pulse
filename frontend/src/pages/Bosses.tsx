import { useEffect, useMemo, useState } from 'react'
import { fetchBoostedBoss } from '@/features/bosses/api'
import BossCard from '@/features/bosses/BossCard'
import BossModal from '@/features/bosses/BossModal'
import { BOSSES, type BossEntry } from '@/features/bosses/bossesData'
import { listWorldNames } from '@/features/worlds/api'
import { useFavorites, type FavoriteRecord } from '@/features/favorites/useFavorites'
import { useAuthStore } from '@/features/auth/useAuthStore'
import { getBossSprite } from '@/features/bosses/sprites'

export default function Bosses() {
  const [worlds, setWorlds] = useState<string[]>([])
  const [selectedWorld, setSelectedWorld] = useState('Antica')
  const [boosted, setBoosted] = useState<{ name: string; imageUrl?: string | null } | null>(null)
  const [query, setQuery] = useState('')
  const [modalBoss, setModalBoss] = useState<BossEntry | null>(null)
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null)

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
    fetchBoostedBoss().then((data) => setBoosted(data))
  }, [])

  useEffect(() => {
    if (!favoriteMessage) return
    const timeout = setTimeout(() => setFavoriteMessage(null), 4000)
    return () => clearTimeout(timeout)
  }, [favoriteMessage])

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
            {filteredBosses.map((entry) => {
              const favorite = isFavorite(entry.name)
              return (
                <BossCard
                  key={entry.name}
                  entry={entry}
                  onSelect={setModalBoss}
                  onToggleFavorite={handleFavoriteToggle}
                  isFavorite={Boolean(favorite)}
                  favoriteDisabled={updatingFavoriteKey === entry.name}
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
