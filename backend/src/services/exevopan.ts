import axios from 'axios'
import type { Auction, Skills, StoreItem, HirelingInfo, CharmInfo, GemsInfo } from '../types/market'
import type { BazaarFilters } from '../types/bazaar'

const DEFAULT_BASE_URL = 'https://exevopan.com'
const DEFAULT_ROUTE = '/api/auctions'
const EXEVOPAN_BASE_URL = (process.env.EXEVOPAN_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '')
const EXEVOPAN_AUCTIONS_ROUTE = process.env.EXEVOPAN_AUCTIONS_ROUTE ?? DEFAULT_ROUTE
const EXEVOPAN_TIMEOUT = Number(process.env.EXEVOPAN_TIMEOUT ?? 12_000)
const EXEVOPAN_PAGE_SIZE = Math.max(1, Number(process.env.EXEVOPAN_PAGE_SIZE ?? 12))
const EXEVOPAN_HEADERS = {
  'User-Agent': 'TibiaPulse/1.0 (+https://tibiapulse.com)',
  Accept: 'application/json',
}

const VOCATION_NAMES: Record<number, string> = {
  0: 'None',
  1: 'Knight',
  2: 'Paladin',
  3: 'Sorcerer',
  4: 'Druid',
  5: 'Monk',
}

const PROMOTED_PREFIX: Record<number, string> = {
  1: 'Elite',
  2: 'Royal',
  3: 'Master',
  4: 'Elder',
  5: 'Exalted',
}

const VOCATION_MATCHERS: Array<{ id: number; regex: RegExp }> = [
  { id: 1, regex: /knight/i },
  { id: 2, regex: /paladin/i },
  { id: 3, regex: /sorc|wizard/i },
  { id: 4, regex: /druid/i },
  { id: 5, regex: /monk/i },
]

const PVP_TYPE_MAP: Record<string, string> = {
  optional: 'optional pvp',
  open: 'open pvp',
  hardcore: 'hardcore pvp',
  'retro open': 'retro open pvp',
  'retro hardcore': 'retro hardcore pvp',
}

type ServerLocation = {
  string: string
}

type PvpType = {
  string: string
}

type ServerData = {
  serverName: string
  battleye: boolean
  serverLocation?: ServerLocation
  pvpType?: PvpType
}

type ExevoCharacter = {
  id: number
  nickname: string
  auctionEnd: number
  currentBid: number
  hasBeenBidded: boolean
  outfitId: string
  serverData: ServerData
  vocationId: number
  level: number
  bossPoints?: number
  tcInvested?: number
  tags?: string[]
  imbuements?: string[]
  items?: number[]
  transfer?: boolean
  quests?: string[]
  storeItems?: StoreItem[]
  hirelings?: HirelingInfo
  preySlot?: boolean
  huntingSlot?: boolean
  charmInfo?: CharmInfo
  gems?: GemsInfo
  greaterGems?: string[]
  skills?: Skills
  storeOutfits?: { name: string; type: number }[]
  storeMounts?: string[]
}

type ExevoResponse = {
  page: ExevoCharacter[]
  totalItems: number
  pageIndex: number
  startOffset: number
  endOffset: number
  sortingMode: number
  descendingOrder: boolean
}

export type ExevoPanResult = { auctions: Auction[]; totalPages: number }

const outfitUrl = (outfitId?: string): string => {
  if (!outfitId) return ''
  if (/^https?:\/\//i.test(outfitId)) return outfitId
  const normalized = outfitId.endsWith('.gif') ? outfitId : `${outfitId}.gif`
  return `https://static.tibia.com/images/charactertrade/outfits/${normalized}`
}

const buildAuctionUrl = (id?: number): string =>
  id ? `https://www.tibia.com/charactertrade/?auctionid=${id}` : ''

const normalizePvp = (value?: string): string | undefined => {
  if (!value) return undefined
  const key = value.trim().toLowerCase()
  return PVP_TYPE_MAP[key] ?? value
}

const formatVocation = (id: number, level: number): string => {
  if (!id) return VOCATION_NAMES[0]
  if (level < 20) return VOCATION_NAMES[id] ?? 'Unknown'
  const prefix = PROMOTED_PREFIX[id]
  const base = VOCATION_NAMES[id] ?? 'Unknown'
  return prefix ? `${prefix} ${base}` : base
}

const encodeNumberSet = (values: number[]): string => values.join(',')
const encodeStringSet = (values: string[]): string =>
  values.map((value) => encodeURIComponent(value)).join(',')

const resolveVocationId = (value?: string): number | null => {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized) return null
  if (/none|any|all/i.test(normalized)) return null
  for (const matcher of VOCATION_MATCHERS) {
    if (matcher.regex.test(normalized)) return matcher.id
  }
  return null
}

const resolveBattleye = (battleye?: boolean): 'green' | 'yellow' | undefined => {
  if (battleye === undefined) return undefined
  return battleye ? 'green' : 'yellow'
}

const toAuction = (character: ExevoCharacter): Auction => ({
  id: character.id,
  name: character.nickname,
  level: character.level,
  vocation: formatVocation(character.vocationId, character.level),
  world: character.serverData?.serverName ?? '',
  currentBid: character.currentBid,
  minimumBid: character.currentBid,
  hasBid: Boolean(character.hasBeenBidded),
  endTime: new Date(character.auctionEnd * 1000).toISOString(),
  url: buildAuctionUrl(character.id),
  portrait: outfitUrl(character.outfitId),
  bossPoints: character.bossPoints,
  charmInfo: character.charmInfo,
  charmPoints: character.charmInfo?.total,
  skills: character.skills,
  items: character.items,
  storeItems: character.storeItems,
  imbuements: character.imbuements,
  quests: character.quests,
  hirelings: character.hirelings,
  preySlot: Boolean(character.preySlot),
  huntingSlot: Boolean(character.huntingSlot),
  gems: character.gems,
  greaterGems: character.greaterGems,
  tags: character.tags,
  tcInvested: character.tcInvested,
  transfer: character.transfer,
  battleye: resolveBattleye(character.serverData?.battleye),
  serverLocation: character.serverData?.serverLocation?.string ?? undefined,
  pvpType: normalizePvp(character.serverData?.pvpType?.string),
})

const toSortingMode = (order?: BazaarFilters['order']): number => {
  switch (order) {
    case 'level':
      return 1
    case 'price':
      return 2
    case 'end':
    default:
      return 0
  }
}

const buildQueryParams = (filters: BazaarFilters): URLSearchParams => {
  const params = new URLSearchParams()
  const pageIndex = Math.max(0, (filters.page ?? 1) - 1)
  params.set('currentPage', pageIndex.toString())
  params.set('pageSize', EXEVOPAN_PAGE_SIZE.toString())
  params.set('orderBy', toSortingMode(filters.order).toString())
  params.set('descending', String(filters.sort === 'desc'))

  if (typeof filters.minLevel === 'number' && filters.minLevel > 0) {
    params.set('minLevel', filters.minLevel.toString())
  }
  if (typeof filters.maxLevel === 'number' && filters.maxLevel > 0) {
    params.set('maxLevel', filters.maxLevel.toString())
  }
  if (filters.world) {
    params.set('serverSet', encodeStringSet([filters.world.trim()]))
  }
  const vocationId = resolveVocationId(filters.vocation)
  if (vocationId !== null) {
    params.set('vocation', encodeNumberSet([vocationId]))
  }
  return params
}

const derivePageSize = (payload: ExevoResponse): number => {
  const derived = Number(payload.endOffset) - Number(payload.startOffset) + 1
  if (Number.isFinite(derived) && derived > 0) return derived
  return EXEVOPAN_PAGE_SIZE
}

const deriveTotalPages = (payload: ExevoResponse): number => {
  const pageSize = derivePageSize(payload)
  if (!payload.totalItems || pageSize <= 0) return 1
  return Math.max(1, Math.ceil(payload.totalItems / pageSize))
}

export async function fetchExevoPanAuctions(filters: BazaarFilters): Promise<ExevoPanResult | null> {
  if (!EXEVOPAN_BASE_URL) return null
  const params = buildQueryParams(filters)
  const query = params.toString()
  const url = `${EXEVOPAN_BASE_URL}${EXEVOPAN_AUCTIONS_ROUTE}${query ? `?${query}` : ''}`

  try {
    const { data } = await axios.get<ExevoResponse>(url, {
      timeout: EXEVOPAN_TIMEOUT,
      headers: EXEVOPAN_HEADERS,
    })
    if (!data || !Array.isArray(data.page)) return null
    const auctions = data.page.map(toAuction)
    return { auctions, totalPages: deriveTotalPages(data) }
  } catch (error) {
    const reason = axios.isAxiosError(error)
      ? error.code ?? error.response?.status ?? error.message
      : String(error)
    console.warn('[marketService] exevo pan fallback failed', { url, reason })
    return null
  }
}
