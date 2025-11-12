import clsx from 'clsx'
import { Heart } from 'lucide-react'
import { getBossSprite } from './sprites'
import type { BossEntry } from './bossesData'

type Props = {
  entry: BossEntry
  onSelect: (entry: BossEntry) => void
  onToggleFavorite?: (entry: BossEntry) => void
  isFavorite?: boolean
  favoriteDisabled?: boolean
}

export default function BossCard({
  entry,
  onSelect,
  onToggleFavorite,
  isFavorite = false,
  favoriteDisabled,
}: Props) {
  const sprite = getBossSprite(entry.name)
  const respawnText = formatRespawn(entry)
  const lootPreview = entry.loot.length ? entry.loot.slice(0, 2).join(', ') : 'Sem loot destacado'

  return (
    <article className="boss-card">
      <header>
        <div className="boss-card__title">
          {sprite && (
            <img
              src={sprite}
              alt={entry.name}
              width={40}
              height={40}
              loading="lazy"
              className="boss-card__sprite"
            />
          )}
          <h3>{entry.name}</h3>
        </div>
        <div className="boss-card__actions">
          {onToggleFavorite && (
            <button
              type="button"
              className={clsx('boss-card__fav', isFavorite && 'is-active')}
              aria-pressed={isFavorite}
              onClick={() => onToggleFavorite(entry)}
              disabled={favoriteDisabled}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart className="size-4" fill={isFavorite ? '#f97316' : 'none'} />
            </button>
          )}
          <button type="button" className="boss-card__details" onClick={() => onSelect(entry)}>
            Detalhes
          </button>
        </div>
      </header>

      <dl>
        <div>
          <dt>Respawn</dt>
          <dd>{respawnText}</dd>
        </div>
        <div>
          <dt>Locais</dt>
          <dd>{entry.locations.length || '—'}</dd>
        </div>
        <div>
          <dt>Loot</dt>
          <dd className="truncate">{lootPreview}</dd>
        </div>
      </dl>
    </article>
  )
}

function formatRespawn(entry: BossEntry) {
  if (!entry.respawn) return '—'
  const { min, max } = entry.respawn
  if (min === max) return `${min} dias`
  return `${min}-${max} dias`
}
