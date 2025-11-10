import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function QuickSearch() {
  const nav = useNavigate()
  const [name, setName] = useState('')

  function go() {
    const trimmed = name.trim()
    if (!trimmed) return
    nav(`/characters/${encodeURIComponent(trimmed)}`)
    setName('')
  }

  return (
    <div className="quick-search">
      <Search className="size-4 text-indigo-500" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && go()}
        placeholder="Buscar personagem…"
      />
      <button type="button" onClick={go}>Ir</button>
    </div>
  )
}
