import { getBossSprite } from './sprites'
import type { BossEntry } from './bossesData'

type Props = {
  entry: BossEntry
  onClose: () => void
}

export default function BossModal({ entry, onClose }: Props) {
  const sprite = getBossSprite(entry.name)
  return (
    <div className="boss-modal__backdrop" role="dialog" aria-modal="true">
      <div className="boss-modal">
        <header>
          <div className="boss-card__title">
            {sprite && <img src={sprite} alt={entry.name} width={48} height={48} className="boss-card__sprite" />}
            <div>
              <h3>{entry.name}</h3>
              <p className="boss-modal__subtitle">{formatRespawn(entry)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        {!!entry.locations?.length && (
          <section className="boss-modal__section">
            <p className="filter-label">Localizações</p>
            <div className="grid gap-3">
              {entry.locations.map((loc) => (
                <article key={loc.description} className="boss-modal__iframe">
                  <p>{loc.description}</p>
                  <iframe
                    title={loc.description}
                    src={loc.mapUrl}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="boss-modal__section">
          <p className="filter-label">Loot relevante</p>
          {entry.loot.length ? (
            <div className="flex flex-wrap gap-2">
              {entry.loot.map((item) => (
                <span key={item} className="perk-badge">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sem loot destacado.</p>
          )}
        </section>

        {!!entry.raidMessages?.length && (
          <section className="boss-modal__section">
            <p className="filter-label">Mensagens da raid</p>
            <ul className="boss-modal__log">
              {entry.raidMessages.map((msg) => (
                <li key={`${msg.time}-${msg.message}`} data-style={msg.style}>
                  <span>{msg.time}</span>
                  <p>{msg.message}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

function formatRespawn(entry: BossEntry) {
  if (!entry.respawn) return 'Respawn desconhecido'
  const { min, max } = entry.respawn
  if (min === max) return `Respawna a cada ${min} dias`
  return `Respawna a cada ${min}-${max} dias`
}
