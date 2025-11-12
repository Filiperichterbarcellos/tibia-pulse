import Container from '@/components/Container'
import { useFavoriteCharacters, type FavoriteCharacter } from '@/features/favorites/useFavoriteCharacters'

export default function Favorites() {
  const { favorites, loading, error, removeFavorite, updatingKey } = useFavoriteCharacters()

  const renderContent = () => {
    if (loading) {
      return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6">Carregando favoritos…</div>
    }

    if (error) {
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-red-200">
          {error}
        </div>
      )
    }

    if (!favorites.length) {
      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6 text-zinc-400">
          Você ainda não salvou nenhum personagem. Use a busca para encontrar alguém e marque como favorito.
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {favorites.map((fav) => (
          <FavoriteCard
            key={fav.id}
            favorite={fav}
            disabled={updatingKey === fav.key}
            onRemove={() => removeFavorite(fav)}
          />
        ))}
      </div>
    )
  }

  return (
    <Container>
      <div className="mb-6 space-y-1">
        <p className="text-sm uppercase tracking-wide text-indigo-300">Meus Favoritos</p>
        <h1 className="text-3xl font-semibold text-white">Personagens salvos</h1>
        <p className="text-white/70">
          Guarde aqui os personagens que você acompanha pela busca do Tibia Pulse.
        </p>
      </div>

      {renderContent()}
    </Container>
  )
}

function FavoriteCard({
  favorite,
  disabled,
  onRemove,
}: {
  favorite: FavoriteCharacter
  disabled?: boolean
  onRemove: () => void
}) {
  const info = extractSnapshot(favorite)

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-white md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {info.outfitUrl ? (
          <img
            src={info.outfitUrl}
            alt=""
            className="h-14 w-14 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xl font-semibold text-white/70">
            {info.initials}
          </div>
        )}

        <div>
          <p className="text-lg font-semibold">{info.name}</p>
          <p className="text-sm text-white/70">
            Level {info.level} • {info.vocation} • {info.world}
          </p>
          {info.lastUpdate && (
            <p className="text-xs text-white/50">Atualizado em {info.lastUpdate}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="self-start rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-400 hover:text-red-100 disabled:opacity-50 md:self-auto"
      >
        Remover
      </button>
    </article>
  )
}

function extractSnapshot(fav: FavoriteCharacter) {
  const snapshot = fav.snapshot ?? {}
  const rawName = snapshot.name ?? fav.key
  const name = rawName && rawName.trim().length > 0 ? rawName : 'Personagem misterioso'
  const level = snapshot.level ?? 0
  const vocation = snapshot.vocation ?? '—'
  const world = snapshot.world ?? '—'
  const outfitUrl = snapshot.outfitUrl ?? null
  const lastUpdate = formatDate(snapshot.lastUpdate)

  return {
    name,
    level,
    vocation,
    world,
    outfitUrl,
    lastUpdate,
    initials: name.slice(0, 2).toUpperCase(),
  }
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
