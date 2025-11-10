// src/features/bazaar/AuctionCard.tsx
import type { ReactNode } from 'react'
import {
  ExternalLink,
  Timer,
  Coins,
  Heart,
  Sparkles,
  MapPin,
  ShieldCheck,
  Swords,
} from 'lucide-react'
import clsx from 'clsx'
import useCountdown from './useCountdown'
import { VOCATION_EMOJI, VOCATION_LABEL } from './constants'
import type { Auction } from './api'
import greenBattleye from '@/assets/greenbattleye.png'
import yellowBattleye from '@/assets/yellowbattleye.png'
import euFlag from '@/assets/eu-flag.png'
import naFlag from '@/assets/na-flag.png'
import brFlag from '@/assets/br-flag.png'
import oceFlag from '@/assets/oce-flag.png'

type Props = Auction & {
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  disableFavorite?: boolean
}

const SKILL_ORDER: Array<{ key: keyof NonNullable<Auction['skills']>; label: string; tone: string }> = [
  { key: 'magic', label: 'Magic', tone: 'bg-emerald-400' },
  { key: 'distance', label: 'Distance', tone: 'bg-sky-400' },
  { key: 'club', label: 'Club', tone: 'bg-amber-400' },
  { key: 'sword', label: 'Sword', tone: 'bg-rose-400' },
  { key: 'axe', label: 'Axe', tone: 'bg-orange-400' },
  { key: 'shielding', label: 'Shielding', tone: 'bg-indigo-400' },
  { key: 'fist', label: 'Fist', tone: 'bg-lime-400' },
  { key: 'fishing', label: 'Fishing', tone: 'bg-cyan-400' },
]

const LOCATION_FLAGS: Record<string, string> = {
  EU: euFlag,
  NA: naFlag,
  BR: brFlag,
  OCE: oceFlag,
}

export default function AuctionCard(a: Props) {
  const { timeLeftText, ended } = useCountdown(a.endDate)
  const voc = VOCATION_LABEL[a.vocation] ?? a.vocation ?? 'None'
  const favoriteEnabled = Boolean(a.onFavoriteToggle)

  const skills = buildSkillBars(a)
  const perks = buildPerks(a)
  const storeItems = (a.storeItems ?? []).map((item) => item.name)
  const priceLabel = a.hasBid ? 'Current bid' : 'Minimum bid'
  const priceValue = a.hasBid ? a.currentBid : a.minimumBid

  return (
    <article className="auction-card">
      <header className="auction-card__header">
        <div className="auction-card__identity">
          <div className="character-sprite">
            {a.outfitUrl ? (
              <img src={a.outfitUrl} alt={`${a.name} outfit`} loading="lazy" />
            ) : (
              <span>{VOCATION_EMOJI[a.vocation] ?? '🎲'}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="auction-card__name">{a.name}</p>
            <p className="auction-card__subtitle">
              Level {a.level} • {voc}
            </p>
          </div>
        </div>

        {favoriteEnabled && (
          <button
            type="button"
            className={clsx('fav-button', a.disableFavorite && 'is-disabled')}
            aria-pressed={a.isFavorite}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              a.onFavoriteToggle?.()
            }}
          >
            <Heart className="size-4" fill={a.isFavorite ? '#22c55e' : 'none'} />
            <span>{a.isFavorite ? 'Salvo' : 'Favoritar'}</span>
          </button>
        )}
      </header>

      <section className="auction-card__meta">
        <MetaBadge
          icon={<MapPin className="size-3" />}
          label="Server"
          value={a.world}
          flag={LOCATION_FLAGS[a.serverLocation ?? ''] ?? null}
        />
        <MetaBadge icon={<Swords className="size-3" />} label="PvP" value={a.pvpType ?? '—'} />
        <MetaBadge
          icon={<ShieldCheck className="size-3" />}
          label="BattlEye"
          value={formatBattlEye(a.battleye)}
          flag={getBattleyeIcon(a.battleye)}
        />
      </section>

      <section className="auction-card__stats">
        <StatCard label="Auction end" value={timeLeftText || 'Sem data'} critical={ended} />
        <StatCard label="Minimum bid" value={`${formatNumber(a.minimumBid)} gp`} />
        <StatCard
          label="Current bid"
          value={a.hasBid ? `${formatNumber(a.currentBid)} gp` : '—'}
          highlight={a.hasBid}
        />
      </section>

      {skills.length > 0 && (
        <section className="auction-card__skills">
          {skills.map((skill) => (
            <SkillBar key={skill.label} {...skill} />
          ))}
        </section>
      )}

      <section className="auction-card__perks">
        {typeof a.charmPoints === 'number' && (
          <PerkBadge icon={<Sparkles className="size-3" />} label="Charm pts" value={a.charmPoints} />
        )}
        {typeof a.bossPoints === 'number' && (
          <PerkBadge icon={<Sparkles className="size-3" />} label="Boss pts" value={a.bossPoints} />
        )}
        {perks.map((perk) => (
          <PerkBadge key={perk} label={perk} />
        ))}
      </section>

      {storeItems.length > 0 && (
        <section className="auction-card__store">
          <p>Store items</p>
          <div className="store-grid">
            {storeItems.slice(0, 6).map((name) => (
              <span key={name}>{name}</span>
            ))}
            {storeItems.length > 6 && <span>+{storeItems.length - 6} itens</span>}
          </div>
        </section>
      )}

      <footer className="auction-card__footer">
        <a href={a.url ?? '#'} target="_blank" rel="noreferrer">
          Ver no tibia.com <ExternalLink className="size-4" />
        </a>
      </footer>
    </article>
  )
}

function buildSkillBars(auction: Auction) {
  if (!auction.skills) return []
  return SKILL_ORDER.map(({ key, label, tone }) => {
    const value = auction.skills?.[key]
    if (typeof value !== 'number' || value <= 0) return null
    const normalized = Math.min(130, value)
    const percentage = (normalized / 130) * 100
    return { label, value, percentage, tone }
  }).filter(Boolean) as Array<{ label: string; value: number; percentage: number; tone: string }>
}

function buildPerks(auction: Auction) {
  const perks: string[] = []
  if (auction.charmInfo?.expansion) perks.push('Charm Expansion')
  if (auction.preySlot) perks.push('Permanent Prey Slot')
  if (auction.huntingSlot) perks.push('Hunting Task Slot')
  if (auction.minimumBid) perks.push(`Min bid ${formatNumber(auction.minimumBid)} gp`)
  if (auction.transfer) perks.push('Transfer disponível')
  if ((auction.hirelings?.count ?? 0) > 0) perks.push('Hirelings')
  return perks
}

function formatNumber(value?: number | null) {
  if (typeof value !== 'number') return '0'
  return value.toLocaleString('pt-BR')
}

function formatBattlEye(battleye?: string | null) {
  if (!battleye) return '—'
  return battleye === 'green' ? 'Green' : 'Yellow'
}

function getBattleyeIcon(battleye?: string | null) {
  if (battleye === 'green') return greenBattleye
  if (battleye === 'yellow') return yellowBattleye
  return null
}

function MetaBadge({
  icon,
  label,
  value,
  flag,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  flag?: string | null
}) {
  return (
    <div className="meta-badge">
      <div className="meta-badge__icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>
          {flag && <img src={flag} alt="" />}
          {value}
        </strong>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
  critical,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
  critical?: boolean
}) {
  return (
    <div className={clsx('stat-card', highlight && 'stat-card--highlight', critical && 'stat-card--critical')}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

function SkillBar({
  label,
  value,
  percentage,
  tone,
}: {
  label: string
  value: number
  percentage: number
  tone: string
}) {
  return (
    <div className="skill-bar">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="skill-bar__track">
        <div className={tone} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function PerkBadge({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: ReactNode
  value?: ReactNode
}) {
  return (
    <span className="perk-badge">
      {icon}
      {label}
      {value != null && <strong>{value}</strong>}
    </span>
  )
}
