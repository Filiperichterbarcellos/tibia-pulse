import { useCallback } from 'react'
import {
  CharmDamageCalculator,
  ImbuementCalculator,
  LootSplitCalculator,
  SkillProgressCalculator,
  StaminaCalculator,
} from '@/features/calculators'

const calculators = [
  {
    id: 'stamina',
    title: 'Stamina',
    description: 'Quanto tempo falta para voltar ao 100%?',
    Component: StaminaCalculator,
  },
  {
    id: 'exercise',
    title: 'Exercise weapons',
    description: 'Calcule custo, tempo e armas necessárias para o próximo skill.',
    Component: SkillProgressCalculator,
  },
  {
    id: 'charm',
    title: 'Charm damage',
    description: 'Compare Low Blow e charms elementais para decidir o melhor efeito.',
    Component: CharmDamageCalculator,
  },
  {
    id: 'loot',
    title: 'Loot split',
    description: 'Divida o lucro automaticamente entre o time após uma hunt.',
    Component: LootSplitCalculator,
  },
  {
    id: 'imbuements',
    title: 'Custo de imbuements',
    description: 'Veja a combinação mais barata entre itens e gold tokens para cada tier.',
    Component: ImbuementCalculator,
  },
] as const

export default function Calculator() {
  const handleNavigate = useCallback((id: string) => {
    if (typeof window === 'undefined') return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className="retro-layout space-y-8">
      <section className="retro-hero space-y-4">
        <div>
          <p className="retro-badge">Calculadoras</p>
          <h1>Ferramentas oficiais do Tibia Pulse</h1>
          <p>
            Utilize os mesmos cálculos de stamina, exercise weapons, loot split e charms que usamos
            no projeto. Clique em uma ferramenta para navegar até ela.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {calculators.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleNavigate(tool.id)}
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-900">{tool.title}</p>
              <p className="text-xs text-slate-600">{tool.description}</p>
              <span className="mt-2 inline-flex items-center text-xs font-semibold text-indigo-600">
                Abrir
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6">
        {calculators.map(({ id, Component }) => (
          <div key={id} id={id} className="scroll-mt-24">
            <Component />
          </div>
        ))}
      </div>
    </div>
  )
}
