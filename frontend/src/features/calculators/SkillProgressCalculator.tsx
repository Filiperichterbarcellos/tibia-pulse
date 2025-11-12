import { useMemo, useState } from 'react'
import clsx from 'clsx'
import lastingSword from '@/assets/lastingSword.gif'
import durableSword from '@/assets/durableSword.gif'
import regularSword from '@/assets/regularSword.gif'
import tibiaCoinImg from '@/assets/tibiacoin.png'
import goldCoinImg from '@/assets/goldcoin.png'
import {
  autoRequiredWeapons,
  customRequiredWeapons,
  requiredSkillPoints,
  skillCost,
  applyTrainingBoosts,
  type ExerciseWeapon,
  type SkillKey,
  type Vocation,
} from './skillProgress'

const VOCATIONS: Array<{ value: Vocation; label: string }> = [
  { value: 'knight', label: 'Knight' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'druid', label: 'Druid' },
  { value: 'sorcerer', label: 'Sorcerer' },
  { value: 'monk', label: 'Monk' },
]

const SKILLS: Array<{ value: SkillKey; label: string }> = [
  { value: 'distance', label: 'Distance' },
  { value: 'melee', label: 'Melee' },
  { value: 'magic', label: 'Magic level' },
  { value: 'shield', label: 'Shield' },
  { value: 'fist', label: 'Fist' },
]

const numberFormatter = new Intl.NumberFormat('pt-BR')

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '—'
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  const parts = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes || (!days && !hours)) parts.push(`${minutes}m`)
  return parts.join(' ')
}

export default function SkillProgressCalculator() {
  const [vocation, setVocation] = useState<Vocation>('paladin')
  const [skill, setSkill] = useState<SkillKey>('distance')
  const [currentLevel, setCurrentLevel] = useState(100)
  const [targetLevel, setTargetLevel] = useState(110)
  const [percentageLeft, setPercentageLeft] = useState(50)
  const [loyalty, setLoyalty] = useState(0)
  const [weaponMode, setWeaponMode] = useState<'auto' | ExerciseWeapon>('auto')
  const [hasDummy, setHasDummy] = useState(false)
  const [doubleEvent, setDoubleEvent] = useState(false)

  const pointsRequired = useMemo(() => {
    return requiredSkillPoints({
      current: currentLevel,
      target: targetLevel,
      percentageLeft,
      skill,
      vocation,
      loyaltyBonus: loyalty,
    })
  }, [currentLevel, targetLevel, percentageLeft, skill, vocation, loyalty])

  const effectivePoints = useMemo(
    () => applyTrainingBoosts(pointsRequired, { dummy: hasDummy, double: doubleEvent }),
    [pointsRequired, hasDummy, doubleEvent],
  )

  const weapons = useMemo(() => {
    if (weaponMode === 'auto') return autoRequiredWeapons(effectivePoints)
    return customRequiredWeapons(effectivePoints, weaponMode)
  }, [effectivePoints, weaponMode])

  const costs = useMemo(() => skillCost(weapons), [weapons])

  const chipsClass = (active: boolean) =>
    clsx(
      'px-3 py-1.5 rounded-full border text-sm font-semibold transition',
      active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300',
    )

  const statCard = 'stat-card flex flex-col gap-1'

  const weaponChips = [
    { key: 'lasting', label: 'lasting', icon: lastingSword, count: weapons.lasting },
    { key: 'durable', label: 'durable', icon: durableSword, count: weapons.durable },
    { key: 'regular', label: 'regular', icon: regularSword, count: weapons.regular },
  ]

  const costChips = [
    { key: 'tc', label: `${numberFormatter.format(costs.tc)} TC`, icon: tibiaCoinImg },
    { key: 'gold', label: `${numberFormatter.format(costs.gold)} gp`, icon: goldCoinImg },
  ]

  return (
    <section className="retro-panel space-y-4">
      <div>
        <p className="filter-label">Skill progress</p>
        <h2 className="text-xl font-semibold text-slate-900">Quanto falta para pegar o próximo skill?</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Vocação</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {VOCATIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={chipsClass(vocation === option.value)}
                  onClick={() => setVocation(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Skill</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SKILLS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={chipsClass(skill === option.value)}
                  onClick={() => setSkill(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="retro-input">
              <span>Skill atual</span>
              <div className="retro-input__field">
                <input
                  type="number"
                  min={0}
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(Number(e.target.value) || 0)}
                />
              </div>
            </label>
            <label className="retro-input">
              <span>Meta</span>
              <div className="retro-input__field">
                <input
                  type="number"
                  min={currentLevel + 1}
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(Number(e.target.value) || 0)}
                />
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-slate-500">
                % restante do nível atual
              </span>
              <span className="text-xs font-semibold text-slate-700">{percentageLeft}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={percentageLeft}
              onChange={(e) => setPercentageLeft(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-slate-500">Loyalty</span>
              <span className="text-xs font-semibold text-slate-700">{loyalty}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={loyalty}
              onChange={(e) => setLoyalty(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex items-center justify-between text-[10px] uppercase text-slate-400">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm">
          <div className="retro-input">
            <span>Modo de arma</span>
            <div className="retro-input__field">
              <select value={weaponMode} onChange={(e) => setWeaponMode(e.target.value as any)}>
                <option value="auto">Auto (lasting &gt; durable &gt; regular)</option>
                <option value="lasting">Somente lasting</option>
                <option value="durable">Somente durable</option>
                <option value="regular">Somente regular</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium">
              <input
                type="checkbox"
                className="retro-checkbox"
                checked={hasDummy}
                onChange={(e) => setHasDummy(e.target.checked)}
              />
              Exercise dummy
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium">
              <input
                type="checkbox"
                className="retro-checkbox"
                checked={doubleEvent}
                onChange={(e) => setDoubleEvent(e.target.checked)}
              />
              Evento double
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className={statCard}>
          <p>Points necessários</p>
          <strong>{numberFormatter.format(Math.max(0, Math.round(pointsRequired)))}</strong>
        </div>
        <div className="stat-card flex flex-col gap-3">
          <p>Armas</p>
          <div className="flex flex-wrap gap-2">
            {weaponChips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
              >
                <img
                  src={chip.icon}
                  alt=""
                  className="h-6 w-6 rounded-full border border-slate-100 bg-slate-50"
                />
                <span className="capitalize">{chip.label}</span>
                <span className="text-xs text-slate-500">
                  {numberFormatter.format(chip.count)}x
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className={clsx(statCard, 'stat-card--highlight gap-3')}>
          <p>Custo</p>
          <div className="flex flex-wrap gap-2">
            {costChips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm"
              >
                <img src={chip.icon} alt="" className="h-5 w-5" />
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={statCard}>
          <p>Tempo necessário</p>
          <strong>{formatDuration(costs.seconds)}</strong>
        </div>
      </div>
    </section>
  )
}
