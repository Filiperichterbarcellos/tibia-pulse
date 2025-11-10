import { useMemo, useState } from 'react'
import { MAX_STAMINA_MINUTES, STAMINA_MINUTES_PER_REAL_MINUTE } from './constants'

function parseStamina(value: string): number {
  const [hours = '0', minutes = '0'] = value.split(':')
  const h = Number(hours)
  const m = Number(minutes)
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return Math.min(MAX_STAMINA_MINUTES, Math.max(0, h * 60 + m))
}

function formatDuration(minutes: number) {
  const totalMinutes = Math.max(0, Math.round(minutes))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const mins = totalMinutes % 60
  const chunks = []
  if (days) chunks.push(`${days}d`)
  if (hours) chunks.push(`${hours}h`)
  if (mins || (!days && !hours)) chunks.push(`${mins}m`)
  return chunks.join(' ')
}

export default function StaminaCalculator() {
  const [current, setCurrent] = useState('39:00')
  const [target, setTarget] = useState('42:00')

  const result = useMemo(() => {
    const currentMinutes = parseStamina(current)
    const targetMinutes = parseStamina(target)
    const delta = Math.max(0, targetMinutes - currentMinutes)
    const realMinutesNeeded = delta / STAMINA_MINUTES_PER_REAL_MINUTE
    return {
      currentMinutes,
      targetMinutes,
      staminaMissing: delta,
      realMinutesNeeded,
      formatted: formatDuration(realMinutesNeeded),
    }
  }, [current, target])

  const invalid = result.currentMinutes > result.targetMinutes

  return (
    <section className="retro-panel space-y-4">
      <div>
        <p className="filter-label">Stamina calculator</p>
        <h2 className="text-xl font-semibold text-slate-900">Quanto tempo até o 100%?</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="retro-input">
          <span>Stamina atual</span>
          <div className="retro-input__field">
            <input
              type="text"
              value={current}
              aria-label="Stamina atual"
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Ex.: 39:00"
            />
          </div>
        </label>

        <label className="retro-input">
          <span>Meta</span>
          <div className="retro-input__field">
            <input
              type="text"
              value={target}
              aria-label="Stamina desejada"
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Ex.: 42:00"
            />
          </div>
        </label>
      </div>

      {invalid ? (
        <div className="retro-panel border-red-200 bg-red-50 text-sm text-red-700">
          A stamina atual não pode ser maior que a desejada.
        </div>
      ) : (
        <div className="stat-card stat-card--highlight">
          <p>Tempo real necessário</p>
          <strong>{result.formatted}</strong>
          <small className="block text-xs text-slate-500 mt-1">
            {result.staminaMissing / 60} horas de stamina faltando ({result.staminaMissing} minutos)
          </small>
        </div>
      )}
    </section>
  )
}
