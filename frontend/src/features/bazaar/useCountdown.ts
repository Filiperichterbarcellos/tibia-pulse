// src/features/bazaar/useCountdown.ts
import { useEffect, useState } from 'react'

export default function useCountdown(endTime?: string) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (!endTime) return
    const tick = () => {
      const end = new Date(endTime).getTime()
      const diff = end - Date.now()
      if (diff <= 0) return setText('Ended')
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setText(`${h}h ${m}m`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [endTime])

  return { timeLeftText: text, ended: text === 'Ended' }
}
