// src/lib/mapAuction.ts
export type AuctionIn = {
  id?: number | string
  name: string
  level?: number | string | null
  vocation?: string | null
  world?: string | null
  currentBid?: number | string | null
  endTime?: string | number | null // e.g. "10 Nov, 18:00" (Tibia.com) ou vazio
  url?: string | null
  portrait?: string | null
  pvpType?: string | null
  skills?: Record<string, number> | null
}

export type AuctionOut = {
  id: number | null
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  endDate: string | null // ISO
  outfitUrl: string | null
  url: string | null
  pvpType: string | null
  skills: Record<string, number> | null
}

const MONTHS_EN = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
} as const

function parseEndTimeToISO(input?: string | number | null): string | null {
  if (!input) return null
  if (typeof input === 'number') {
    const ms = input > 10_000_000_000 ? input : input * 1000
    const d = new Date(ms); return isNaN(d.getTime()) ? null : d.toISOString()
  }
  // tenta "10 Nov, 18:00"
  const m = String(input).trim().match(/^(\d{1,2})\s+([A-Za-z]{3}),\s*(\d{1,2}):(\d{2})$/)
  if (m) {
    const [, dd, mon, hh, mm] = m
    const month = MONTHS_EN[mon.toLowerCase() as keyof typeof MONTHS_EN]
    if (month !== undefined) {
      const now = new Date()
      const d = new Date(Date.UTC(now.getUTCFullYear(), month, Number(dd), Number(hh), Number(mm)))
      return isNaN(d.getTime()) ? null : d.toISOString()
    }
  }
  // tenta Date.parse nativo
  const d = new Date(input)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

export function mapAuction(a: AuctionIn): AuctionOut {
  return {
    id: a.id != null ? Number(a.id) : null,
    name: a.name,
    level: a.level != null ? Number(a.level) || 0 : 0,
    vocation: a.vocation || '—',
    world: a.world || '—',
    currentBid: a.currentBid != null ? Number(a.currentBid) || 0 : 0,
    endDate: parseEndTimeToISO(a.endTime ?? null),
    outfitUrl: a.portrait || null, // 👉 renomeia portrait -> outfitUrl
    url: a.url || null,
    pvpType: a.pvpType || null,
    skills: a.skills || null,
  }
}
