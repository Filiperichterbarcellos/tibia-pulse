import { useMemo, useState } from 'react'
import {
  LOW_BLOW_MULTIPLIER,
  ELEMENTAL_DAMAGE,
  ELEMENTAL_PROC_CHANCE,
  POWERFUL_MULTIPLIER,
} from './constants'

export default function CharmDamageCalculator() {
  const [avgDamage, setAvgDamage] = useState(500)
  const [creatureHp, setCreatureHp] = useState(2000)
  const [bonusResistance, setBonusResistance] = useState(0)
  const [powerfulCharm, setPowerfulCharm] = useState(false)

  const lowBlow = useMemo(
    () => Math.round(avgDamage * LOW_BLOW_MULTIPLIER),
    [avgDamage],
  )

  const elemental = useMemo(() => {
    const elementalChunk =
      creatureHp *
      (ELEMENTAL_PROC_CHANCE *
        (ELEMENTAL_DAMAGE * (1 + bonusResistance / 100)))
    const base = avgDamage * (powerfulCharm ? POWERFUL_MULTIPLIER : 1)
    return Math.round(base + elementalChunk)
  }, [avgDamage, powerfulCharm, creatureHp, bonusResistance])

  return (
    <section className="retro-panel space-y-4">
      <div>
        <p className="filter-label">Charm damage</p>
        <h2 className="text-xl font-semibold text-slate-900">Compare Low Blow e Charms elementais</h2>
      </div>

      <label className="retro-input">
        <span>Seu dano médio</span>
        <div className="retro-input__field">
          <input
            type="number"
            min={0}
            step={50}
            value={avgDamage}
            onChange={(e) => setAvgDamage(Number(e.target.value) || 0)}
          />
        </div>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="retro-input">
          <span>HP da criatura</span>
          <div className="retro-input__field">
            <input
              type="number"
              min={0}
              step={100}
              value={creatureHp}
              onChange={(e) => setCreatureHp(Number(e.target.value) || 0)}
            />
          </div>
        </label>

        <label className="retro-input">
          <span>Bônus de resistência do alvo</span>
          <div className="retro-input__field">
            <input
              type="number"
              min={-100}
              max={100}
              value={bonusResistance}
              onChange={(e) => setBonusResistance(Number(e.target.value) || 0)}
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="retro-checkbox"
          checked={powerfulCharm}
          onChange={(e) => setPowerfulCharm(e.target.checked)}
        />
        Usar charm poderoso
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="stat-card">
          <p>Low Blow médio</p>
          <strong>{lowBlow.toLocaleString('pt-BR')}</strong>
          <small className="block text-xs text-slate-500 mt-1">Inclui bônus de crítico (+9%)</small>
        </div>
        <div className="stat-card">
          <p>Charm elemental médio</p>
          <strong>{elemental.toLocaleString('pt-BR')}</strong>
          <small className="block text-xs text-slate-500 mt-1">
            Chance de proc: {Math.round(ELEMENTAL_PROC_CHANCE * 100)}% • Dano base {ELEMENTAL_DAMAGE * 100}%
          </small>
        </div>
      </div>
    </section>
  )
}
