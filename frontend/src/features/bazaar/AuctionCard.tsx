// src/features/bazaar/AuctionCard.tsx
import { ExternalLink, Timer, Coins, Globe } from 'lucide-react'
import useCountdown from './useCountdown'
import { VOCATION_EMOJI, VOCATION_LABEL, VOCATION_COLOR } from './constants'
import clsx from 'clsx'

type Props = {
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  hasBid: boolean
  endTime: string
  url: string
  portrait?: string
}

export default function AuctionCard(a: Props) {
  const { timeLeftText, ended } = useCountdown(a.endTime)
  const voc = VOCATION_LABEL[a.vocation] ?? a.vocation ?? 'None'

  return (
    <article className="group rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm hover:shadow-md hover:border-zinc-700 transition-all overflow-hidden">
      {/* Top */}
      <div className="p-4 flex gap-3">
        <div className="h-16 w-16 rounded-xl bg-zinc-800 grid place-items-center overflow-hidden ring-1 ring-zinc-700/50">
          {a.portrait ? (
            <img
              src={a.portrait}
              alt={`${a.name} portrait`}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-2xl">{VOCATION_EMOJI[a.vocation] ?? '🎲'}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-zinc-100 truncate">{a.name}</h3>
            <span
              className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
                VOCATION_COLOR[a.vocation] ?? VOCATION_COLOR['None'],
              )}
              title={voc}
            >
              {voc}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">Level {a.level}</p>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Globe className="size-4" />
            <div>
              <dt className="sr-only">Server</dt>
              <dd className="text-zinc-200">{a.world}</dd>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Timer className="size-4" />
            <div>
              <dt className="sr-only">Ends in</dt>
              <dd className={clsx('text-zinc-200', ended && 'text-red-300')}>
                {timeLeftText || a.endTime}
              </dd>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-2 text-zinc-400">
            <Coins className="size-4" />
            <div>
              <dt className="sr-only">{a.hasBid ? 'Current bid' : 'Min bid'}</dt>
              <dd className="text-zinc-200">
                {a.hasBid ? 'Current bid' : 'Min bid'}:{' '}
                <span className="font-medium">{a.currentBid.toLocaleString()} gp</span>
              </dd>
            </div>
          </div>
        </dl>

        <a
          href={a.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
        >
          Ver no tibia.com <ExternalLink className="size-4" />
        </a>
      </div>

      {/* Glow hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-indigo-500/5 to-emerald-500/5" />
      </div>
    </article>
  )
}
