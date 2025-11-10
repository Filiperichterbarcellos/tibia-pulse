import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Home() {
  const nav = useNavigate()
  const [name, setName] = useState('')

  return (
    <div className="max-w-6xl mx-auto container-px py-8 grid gap-6">
      <section className="card">
        <div className="card-inner grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Explore personagens, leilões e mundos
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Visual no estilo Exevo Pan, em React + Vite.
            </p>
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="Digite o nome do personagem…"
                className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              />
              <button
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700"
                onClick={()=> name && nav(`/characters/${encodeURIComponent(name)}`)}
              >
                Buscar
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Configure <code>VITE_API_BASE_URL</code> no .env para consumir teu backend.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
