import { ORDER_FIELDS, ORDER_DIR, VOCATION_LABEL } from './constants'
import type { AuctionFilters } from './api'

type Props = {
  value: AuctionFilters
  onChange: (v: AuctionFilters) => void
}

const VOCATIONS = Object.keys(VOCATION_LABEL)

export default function BazaarFilters({ value, onChange }: Props) {
  const set = (patch: Partial<AuctionFilters>) => onChange({ ...value, ...patch })

  const Chip = ({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm border ${
        active ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      {/* linha 1: texto + números */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="World…"
          value={value.world ?? ''}
          onChange={(e) => set({ world: e.target.value || undefined })}
          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Min lvl"
          value={value.minLevel ?? ''}
          onChange={(e) => set({ minLevel: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Max lvl"
          value={value.maxLevel ?? ''}
          onChange={(e) => set({ maxLevel: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <select
            value={value.order ?? 'price'}
            onChange={(e) => set({ order: e.target.value as any })}
            className="flex-1 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
          >
            {ORDER_FIELDS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={value.sort ?? 'desc'}
            onChange={(e) => set({ sort: e.target.value as any })}
            className="w-28 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
          >
            {ORDER_DIR.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* linha 2: vocations chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {VOCATIONS.map((v) => (
          <Chip
            key={v}
            active={value.vocation === v}
            onClick={() => set({ vocation: value.vocation === v ? undefined : (v as any) })}
          >
            {VOCATION_LABEL[v] ?? v}
          </Chip>
        ))}
      </div>
    </div>
  )
}
