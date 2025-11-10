// src/lib/mapAuction.ts
export type AuctionIn = {
  id?: number | string
  name: string
  level?: number | string | null
  vocation?: string | null
  world?: string | null
  currentBid?: number | string | null
  minimumBid?: number | string | null
  endTime?: string | number | null // e.g. "10 Nov, 18:00" (Tibia.com) ou vazio
  url?: string | null
  portrait?: string | null
  pvpType?: string | null
  skills?: Record<string, number> | null
  hasBid?: boolean | null
  charmPoints?: number | null
  charmInfo?: { total?: number | null; expansion?: boolean | null } | null
  bossPoints?: number | null
  items?: number[] | null
  storeItems?: Array<{ name: string; amount: number }> | null
  imbuements?: string[] | null
  quests?: string[] | null
  hirelings?: { count?: number; jobs?: number; outfits?: number } | null
  gems?: { lesser?: number; regular?: number; greater?: number } | null
  greaterGems?: string[] | null
  preySlot?: boolean | null
  huntingSlot?: boolean | null
  battleye?: string | null
  serverLocation?: string | null
  transfer?: boolean | null
}

export type AuctionOut = {
  id: number | null
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  minimumBid: number
  endDate: string | null // ISO
  outfitUrl: string | null
  url: string | null
  pvpType: string | null
  skills: Record<string, number> | null
  hasBid: boolean
  charmPoints: number | null
  charmInfo: { total: number | null; expansion: boolean } | null
  bossPoints: number | null
  items: number[] | null
  storeItems: Array<{ name: string; amount: number }> | null
  imbuements: string[] | null
  quests: string[] | null
  hirelings: { count: number; jobs: number; outfits: number } | null
  gems: { lesser: number; regular: number; greater: number } | null
  greaterGems: string[] | null
  preySlot: boolean
  huntingSlot: boolean
  battleye: string | null
  serverLocation: string | null
  transfer: boolean
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
  const minimumBid = a.minimumBid != null ? Number(a.minimumBid) || 0 : 0
  const charmInfo =
    a.charmInfo || typeof a.charmPoints === 'number'
      ? {
          total:
            typeof a.charmInfo?.total === 'number'
              ? a.charmInfo.total
              : typeof a.charmPoints === 'number'
                ? a.charmPoints
                : null,
          expansion: Boolean(a.charmInfo?.expansion),
        }
      : null

  const normalizeStoreItems = (items?: Array<{ name: string; amount: number }> | null) => {
    if (!Array.isArray(items)) return null
    const mapped = items
      .map((item) => {
        if (!item) return null
        const name = item.name?.trim()
        if (!name) return null
        return {
          name,
          amount: Number.isFinite(item.amount) ? Number(item.amount) : 1,
        }
      })
      .filter((value): value is { name: string; amount: number } => Boolean(value))
    return mapped.length ? mapped : null
  }

  const normalizeNumberArray = (values?: number[] | null) => {
    if (!Array.isArray(values) || !values.length) return null
    return values.map((value) => Number(value))
  }

  const hirelings = a.hirelings
    ? {
        count: Number(a.hirelings.count || 0),
        jobs: Number(a.hirelings.jobs || 0),
        outfits: Number(a.hirelings.outfits || 0),
      }
    : null

  const gems = a.gems
    ? {
        lesser: Number(a.gems.lesser || 0),
        regular: Number(a.gems.regular || 0),
        greater: Number(a.gems.greater || 0),
      }
    : null

  const greaterGems = Array.isArray(a.greaterGems) && a.greaterGems.length ? a.greaterGems : null
  const imbuements = Array.isArray(a.imbuements) && a.imbuements.length ? a.imbuements : null
  const quests = Array.isArray(a.quests) && a.quests.length ? a.quests : null

  return {
    id: a.id != null ? Number(a.id) : null,
    name: a.name,
    level: a.level != null ? Number(a.level) || 0 : 0,
    vocation: a.vocation || '—',
    world: a.world || '—',
    currentBid: a.currentBid != null ? Number(a.currentBid) || 0 : 0,
    minimumBid,
    endDate: parseEndTimeToISO(a.endTime ?? null),
    outfitUrl: a.portrait || null, // 👉 renomeia portrait -> outfitUrl
    url: a.url || null,
    pvpType: a.pvpType || null,
    skills: a.skills || null,
    hasBid: Boolean(a.hasBid),
    charmPoints: typeof a.charmPoints === 'number' ? a.charmPoints : null,
    bossPoints: typeof a.bossPoints === 'number' ? a.bossPoints : null,
    charmInfo,
    items: normalizeNumberArray(a.items),
    storeItems: normalizeStoreItems(a.storeItems),
    imbuements,
    quests,
    hirelings,
    gems,
    greaterGems,
    preySlot: Boolean(a.preySlot),
    huntingSlot: Boolean(a.huntingSlot),
    battleye: a.battleye ? a.battleye : null,
    serverLocation: a.serverLocation ?? null,
    transfer: Boolean(a.transfer),
  }
}
