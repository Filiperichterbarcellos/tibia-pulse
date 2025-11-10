import { useMemo, useState } from 'react'
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

const VOCATIONS: Vocation[] = ['knight', 'paladin', 'druid', 'sorcerer', 'monk']
const SKILLS: Array<{ value: SkillKey; label: string }> = [
  { value: 'magic', label: 'Magic' },
  { value: 'distance', label: 'Distance' },
  { value: 'melee', label: 'Melee' },
  { value: 'shield', label: 'Shield' },
  { value: 'fist', label: 'Fist' },
]

export default function SkillProgressCalculator() {
  const [vocation, setVocation] = useState<Vocation>('paladin')
  const [skill, setSkill] = useState<SkillKey>('distance')
  const [currentLevel, setCurrentLevel] = useState(100)
  const [targetLevel, setTargetLevel] = useState(110)
  const [percentage, setPercentage] = useState(0)
  const [loyalty, setLoyalty] = useState(0)
  const [weaponMode, setWeaponMode] = useState<'auto' | ExerciseWeapon>('auto')
  const [hasDummy, setHasDummy] = useState(false)
  const [doubleEvent, setDoubleEvent] = useState(false)

  const pointsRequired = useMemo(() => {
    return requiredSkillPoints({
      current: currentLevel,
      target: targetLevel,
      percentage,
      skill,
      vocation,
      loyaltyBonus: loyalty,
    })
  }, [currentLevel, targetLevel, percentage, skill, vocation, loyalty])

  const effectivePoints = useMemo(
    () => applyTrainingBoosts(pointsRequired, { dummy: hasDummy, double: doubleEvent }),
    [pointsRequired, hasDummy, doubleEvent],
  )

  const weapons = useMemo(() => {
    if (weaponMode === 'auto') return autoRequiredWeapons(effectivePoints)
    return customRequiredWeapons(effectivePoints, weaponMode)
  }, [effectivePoints, weaponMode])

  const costs = useMemo(() => skillCost(weapons), [weapons])

  return (
    <section className="retro-panel space-y-4">
      <div>
        <p className="filter-label">Skill progress</p>
        <h2 className="text-xl font-semibold text-slate-900">Quanto falta para pegar o próximo skill?</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="retro-input">
          <span>Vocação</span>
          <div className="retro-input__field">
            <select value={vocation} onChange={(e) => setVocation(e.target.value as Vocation)}>
              {VOCATIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="retro-input">
          <span>Skill</span>
          <div className="retro-input__field">
            <select value={skill} onChange={(e) => setSkill(e.target.value as SkillKey)}>
              {SKILLS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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

      <div className="grid gap-3 md:grid-cols-3">
        <label className="retro-input">
          <span>% completado do nível atual</span>
          <div className="retro-input__field">
            <input
              type="number"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value) || 0)}
            />
            <span className="text-xs text-slate-500">%</span>
          </div>
        </label>
        <label className="retro-input">
          <span>Bônus de loyalty</span>
          <div className="retro-input__field">
            <input
              type="number"
              min={0}
              max={50}
              value={loyalty}
              onChange={(e) => setLoyalty(Number(e.target.value) || 0)}
            />
            <span className="text-xs text-slate-500">%</span>
          </div>
        </label>
        <label className="retro-input">
          <span>Modo de arma</span>
          <div className="retro-input__field">
            <select value={weaponMode} onChange={(e) => setWeaponMode(e.target.value as any)}>
              <option value="auto">Auto (lasting &gt; durable &gt; regular)</option>
              <option value="lasting">Somente lasting</option>
              <option value="durable">Somente durable</option>
              <option value="regular">Somente regular</option>
            </select>
          </div>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="retro-checkbox"
            checked={hasDummy}
            onChange={(e) => setHasDummy(e.target.checked)}
          />
          Exercise dummy
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="retro-checkbox"
            checked={doubleEvent}
            onChange={(e) => setDoubleEvent(e.target.checked)}
          />
          Evento double
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="stat-card">
          <p>Points necessários</p>
          <strong>{Math.ceil(pointsRequired).toLocaleString('pt-BR')}</strong>
        </div>
        <div className="stat-card">
          <p>Armas</p>
          <strong>
            {weapons.lasting} lasting / {weapons.durable} durable / {weapons.regular} regular
          </strong>
        </div>
        <div className="stat-card stat-card--highlight">
          <p>Custo</p>
          <strong>
            {costs.tc.toLocaleString('pt-BR')} TC ({costs.gold.toLocaleString('pt-BR')} gp)
          </strong>
        </div>
      </div>
    </section>
  )
}
