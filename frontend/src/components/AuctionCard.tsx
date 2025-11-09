// src/components/AuctionCard.tsx
import type { AuctionDTO, Skills } from '@/types/auction'

type Props = { a: AuctionDTO }

function fmtEnd(a: AuctionDTO) {
  if (a.endTime && a.endTime.trim()) return a.endTime.trim()
  if (!a.endDate) return '—'
  const d = new Date(a.endDate)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

function topSkills(skills?: Skills, take = 3): Array<[string, number]> {
  if (!skills) return []
  const entries = Object.entries(skills).filter(([, v]) => typeof v === 'number') as Array<
    [string, number]
  >
  entries.sort((a, b) => b[1] - a[1])
  return entries.slice(0, take)
}

export default function AuctionCard({ a }: Props) {
  const top = topSkills(a.skills, 3)

  return (
    <a
      href={a.url || '#'}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-5 hover:bg-zinc-900/80 hover:border-zinc-700 transition"
    >
      <div className="flex gap-4 items-start">
        {a.outfitUrl ? (
          <img
            src={a.outfitUrl}
            alt={a.name}
            width={56}
            height={56}
            className="rounded-xl shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-zinc-800 grid place-items-center text-[10px] text-zinc-300">
            sem sprite
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{a.name}</div>
              <div className="text-sm text-zinc-400 truncate">
                {a.vocation} • Lv {a.level || '—'} • {a.world}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="rounded-md border border-emerald-500/30 px-2 py-0.5 text-emerald-300 text-xs">
                Lance: {a.currentBid?.toLocaleString?.() ?? a.currentBid} gp
              </span>
              <span className="rounded-md border border-amber-500/30 px-2 py-0.5 text-amber-300 text-xs">
                Termina: {fmtEnd(a)}
              </span>
            </div>
          </div>

          {/* Chips extras */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {typeof a.charmPoints === 'number' && (
              <span className="rounded-md border border-sky-500/30 px-2 py-0.5 text-sky-300">
                Charms: {a.charmPoints}
              </span>
            )}
            {typeof a.bossPoints === 'number' && (
              <span className="rounded-md border border-purple-500/30 px-2 py-0.5 text-purple-300">
                Boss pts: {a.bossPoints}
              </span>
            )}
            {top.map(([k, v]) => (
              <span
                key={k}
                className="rounded-md border border-zinc-700/60 px-2 py-0.5 text-zinc-300"
                title="Top skills"
              >
                {k}: {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  )
}
