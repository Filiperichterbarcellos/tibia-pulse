import clsx from 'clsx'
import { Heart } from 'lucide-react'
import { getBossSprite } from './sprites'
import type { BossEntry } from './bossesData'
import type { KillStatsEntry } from './api'

type Props = {
  entry: BossEntry
  onSelect: (entry: BossEntry) => void
  onToggleFavorite?: (entry: BossEntry) => void
  isFavorite?: boolean
  favoriteDisabled?: boolean
  worldStats?: KillStatsEntry
  worldName?: string
}

export default function BossCard({
  entry,
  onSelect,
  onToggleFavorite,
  isFavorite = false,
  favoriteDisabled,
  worldStats,
  worldName,
}: Props) {
  const sprite = getBossSprite(entry.name)
  const respawnText = formatRespawn(entry)
  const lootPreview = entry.loot.length ? entry.loot.slice(0, 2).join(', ') : 'Sem loot destacado'
  const recentInfo = getRecentKillLabel(worldStats, worldName)

  return (
    <article className="boss-card" data-highlight={recentInfo ? 'recent' : undefined}>
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
          <div>
            <h3>{entry.name}</h3>
            {recentInfo && <p className="boss-card__recent">{recentInfo}</p>}
          </div>
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
        {worldStats && (
          <div>
            <dt>Mortes recentes</dt>
            <dd>
              {worldStats.last_day_killed > 0
                ? `${worldStats.last_day_killed} nas últimas 24h`
                : `${worldStats.last_week_killed} na última semana`}
            </dd>
          </div>
        )}
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

function getRecentKillLabel(stats?: KillStatsEntry, worldName?: string) {
  if (!stats) return null
  if (stats.last_day_killed > 0) {
    return `Apareceu em ${worldName ?? 'este mundo'} nas últimas 24h`
  }
  if (stats.last_week_killed > 0) {
    return `Apareceu em ${worldName ?? 'este mundo'} na última semana`
  }
  return null
}
