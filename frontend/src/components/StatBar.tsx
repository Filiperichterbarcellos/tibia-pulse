export function StatBar({ label, value }:{ label:string, value?: number }) {
  const v = typeof value === 'number' ? value : 0
  const pct = Math.max(0, Math.min(100, (v/120)*100)) // normalização simples
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{v || '—'}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
