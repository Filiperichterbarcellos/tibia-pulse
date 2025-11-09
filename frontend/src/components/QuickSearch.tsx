import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function QuickSearch() {
  const nav = useNavigate()
  const [name, setName] = useState('')

  function go() {
    const trimmed = name.trim()
    if (!trimmed) return
    nav(`/character/${encodeURIComponent(trimmed)}`)
    setName('')
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e)=>setName(e.target.value)}
        onKeyDown={(e)=> e.key === 'Enter' && go()}
        placeholder="Buscar personagem…"
        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
      />
      <button className="px-3 py-2 rounded-xl bg-brand-600 text-white border border-brand-700 hover:bg-brand-700" onClick={go}>
        <Search className="size-4" />
      </button>
    </div>
  )
}
