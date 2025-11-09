export function Badge({ children, tone='zinc' }:{
  children: React.ReactNode, tone?: 'zinc'|'green'|'blue'|'amber'
}) {
  const base = 'inline-flex items-center rounded-lg border px-2 py-0.5 text-xs'
  const tones: Record<string,string> = {
    zinc:  'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border-zinc-800',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    blue:  'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700',
  }
  return <span className={`${base} ${tones[tone]}`}>{children}</span>
}
