import { getBossSprite } from './sprites'
import type { BossEntry } from './bossesData'

type Props = {
  entry: BossEntry
  onSelect: (entry: BossEntry) => void
}

export default function BossCard({ entry, onSelect }: Props) {
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
        <button type="button" onClick={() => onSelect(entry)}>
          Detalhes
        </button>
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
