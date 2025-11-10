// src/features/bazaar/useCountdown.ts
import { useEffect, useState } from 'react'

type CountdownState = {
  timeLeftText: string
  ended: boolean
}

export default function useCountdown(endDate?: string | null) {
  const [state, setState] = useState<CountdownState>({ timeLeftText: '', ended: false })

  useEffect(() => {
    if (!endDate) {
      setState({ timeLeftText: 'Sem data', ended: false })
      return
    }

    const tick = () => {
      const timestamp = Date.parse(endDate)
      if (Number.isNaN(timestamp)) {
        setState({ timeLeftText: endDate, ended: false })
        return
      }

      const diff = timestamp - Date.now()
      if (diff <= 0) {
        setState({ timeLeftText: 'Encerrado', ended: true })
        return
      }

      const totalMinutes = Math.floor(diff / 60_000)
      const days = Math.floor(totalMinutes / (60 * 24))
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
      const minutes = totalMinutes % 60

      const text =
        days > 0
          ? `${days}d ${hours}h`
          : hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`

      setState({ timeLeftText: text, ended: false })
    }

    tick()
    const id = window.setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [endDate])

  return state
}
