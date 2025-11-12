import axios from 'axios'
import * as cheerio from 'cheerio'
import type { Auction, Skills, StoreItem, HirelingInfo, CharmInfo, GemsInfo } from '../types/market'
import type { BazaarFilters } from '../types/bazaar'
import { TibiaDataClient } from './tibiadata'
import { getWorlds } from './worlds'
import { FALLBACK_AUCTIONS } from '../data/fallbackAuctions'
import { fetchExevoPanAuctions } from './exevopan'

const DEFAULT_IP = process.env.TIBIA_PROXY_IP ?? '189.14.128.23'
const ALL_ORIGINS_BASE =
  process.env.BAZAAR_PROXY_URL ?? 'https://api.allorigins.win/raw?url='
const PROXY_PREFIX = process.env.TIBIA_PROXY_PREFIX ?? 'https://r.jina.ai/'
const TIBIA_HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) TibiaPulse/1.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://www.tibia.com/charactertrade/',
  Origin: 'https://www.tibia.com',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  Cookie: 'TibiaComLang=en',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Dest': 'document',
}

function spoofHeaders() {
  const ip = DEFAULT_IP.replace(/\d+$/, () =>
    Math.max(2, Math.floor(Math.random() * 200)).toString(),
  )
  return {
    ...TIBIA_HTTP_HEADERS,
    'X-Forwarded-For': ip,
  }
}

function looksLikeCloudflare(html: string) {
  const lower = html.toLowerCase()
  return lower.includes('cloudflare') && lower.includes('cf-error-details')
}

function looksLikeMarkdown(html: string) {
  const trimmed = html.trimStart()
  if (!trimmed) return false
  if (trimmed.startsWith('Title:') && trimmed.includes('Markdown Content:')) return true
  if (trimmed.startsWith('Markdown Content:')) return true
  return false
}

const RETRIABLE_ERROR_CODES = new Set([
  'EAI_AGAIN',
  'ENOTFOUND',
  'ECONNRESET',
  'ETIMEDOUT',
  'EPIPE',
])

function shouldFallback(err: unknown) {
  if (!axios.isAxiosError(err)) return false
  const status = err.response?.status ?? 0
  if (status === 403 || status === 429 || status === 503) return true
  if (!err.response && err.code && RETRIABLE_ERROR_CODES.has(err.code)) return true
  return false
}

async function fetchBazaarHtml(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, { timeout: 15_000, headers: spoofHeaders() })
    const html = typeof data === 'string' ? data : data?.toString?.() ?? ''
    if (!looksLikeCloudflare(html)) {
      return html
    }
    console.warn('[marketService] cloudflare challenge detected, retrying via proxy', { url })
  } catch (err) {
    if (!shouldFallback(err)) throw err
    console.warn('[marketService] direct request blocked, fallback via proxy', {
      url,
      status: axios.isAxiosError(err) ? err.response?.status : undefined,
    })
  }

  try {
    const proxyUrl = `${ALL_ORIGINS_BASE}${encodeURIComponent(url)}`
    const { data: proxied } = await axios.get(proxyUrl, { timeout: 20_000 })
    const html = typeof proxied === 'string' ? proxied : proxied?.toString?.() ?? ''
    if (html) {
      return html
    }
  } catch (err) {
    console.warn('[marketService] allorigins proxy failed', {
      url,
      reason: axios.isAxiosError(err) ? err.response?.status : String(err),
    })
  }

  const proxyUrl = `${PROXY_PREFIX}${url}`
  const { data: proxied } = await axios.get(proxyUrl, { timeout: 20_000 })
  return typeof proxied === 'string' ? proxied : proxied?.toString?.() ?? ''
}

type CheerioInstance = ReturnType<typeof cheerio.load>

// ---- Caches ----
const LIST_CACHE_TTL = 60_000
const listCache = new Map<string, { at: number; data: Auction[] }>()
const DETAIL_CACHE_TTL = 10 * 60_000
const detailCache = new Map<string, { at: number; data: Partial<Auction> }>()
const LEVEL_CACHE_TTL = 10 * 60_000
const levelCache = new Map<string, { at: number; level: number }>()
const CONCURRENCY = 4
const WORLD_META_TTL = 5 * 60_000
const worldMetaCache = new Map<string, { at: number; meta: WorldMeta | undefined }>()
let markdownDetailSnippetLogged = false
let fallbackAuctionsLogged = false

type WorldMeta = {
  name: string
  location?: string
  pvp_type?: string
  pvpType?: string
  battleye_status?: string
  battleye?: string
}

// ---- Utils ----
function cacheKey(f: BazaarFilters) {
  return JSON.stringify({
    world: f.world || '',
    vocation: f.vocation || '',
    minLevel: f.minLevel || '',
    maxLevel: f.maxLevel || '',
    page: f.page || 1,
    order: f.order || 'end',
    sort: f.sort || 'asc',
  })
}

function buildBazaarUrl(f: BazaarFilters) {
  const params = new URLSearchParams()
  if (f.world) params.set('world', f.world)
  if (f.vocation) params.set('profession', f.vocation)
  if (f.minLevel) params.set('minlevel', String(f.minLevel))
  if (f.maxLevel) params.set('maxlevel', String(f.maxLevel))
  if (f.page) params.set('page', String(f.page))
  if (f.order) params.set('order', f.order)
  if (f.sort) params.set('sort', f.sort)
  return `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&${params.toString()}`
}

function pickFirstNumber(text: string): number {
  const m = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)/)
  if (!m) return 0
  const normalized = m[1].replace(/[.,]/g, '')
  return Number.parseInt(normalized, 10)
}

function extractNumber(source: string, pattern: RegExp): number {
  const match = source.match(pattern)
  if (!match) return 0
  const target = match[1] ?? match[0]
  return pickFirstNumber(target)
}

function extractString(source: string, pattern: RegExp): string {
  const match = source.match(pattern)
  if (!match) return ''
  return (match[1] ?? match[0]).trim()
}

function absolutize(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://www.tibia.com${url}`
  return url
}

function parseMarkdownAuctions(raw: string): Auction[] {
  const [, afterMarker] = raw.split('Markdown Content:')
  const content = (afterMarker ?? raw).replace(/\r/g, '')
  const entryRegex =
    /\[!\[Image\s+\d+\]\([^)]+\)\]\((https:\/\/www\.tibia\.com\/charactertrade\/\?subtopic=currentcharactertrades&page=details&auctionid=(\d+)[^)]*)\)([\s\S]*?)(?=\[!\[Image\s+\d+\]\(|$)/g
  const auctions: Auction[] = []
  let match: RegExpExecArray | null

  while ((match = entryRegex.exec(content))) {
    const url = match[1]
    const id = Number(match[2])
    const block = match[3]

    const level = extractNumber(block, /Level:\s*([0-9]+)/i)
    const vocation = extractString(block, /Vocation:\s*([^|]+?)(?:\||$)/i)
    const world = extractString(block, /World:\s*\[([^\]]+)/i)
    const endTime =
      extractString(block, /Auction End:\s*([^*]+?)(?=\s+(?:Minimum|Current)\s+Bid)/i) ||
      extractString(block, /Auction End:\s*([^\n]+)/i)
    const currentBid = extractNumber(block, /Current Bid:\s*\*\*([\d.,]+)/i)
    const minimumBid = extractNumber(block, /Minimum Bid:\s*\*\*([\d.,]+)/i) || currentBid
    const hasBid = /Current Bid:/i.test(block)
    const portrait =
      extractString(
        block,
        /(https:\/\/static\.tibia\.com\/images\/charactertrade\/outfits\/[^\s)]+)/i,
      ) || ''

    auctions.push({
      id,
      name: `Auction #${id}`,
      level,
      vocation: vocation || '',
      world: world || '',
      currentBid: hasBid ? currentBid : 0,
      minimumBid,
      hasBid,
      endTime: endTime || '',
      url,
      portrait: portrait,
    })
  }

  return auctions
}

function extractWorldList(payload: any): WorldMeta[] {
  if (!payload) return []
  if (Array.isArray(payload.regular_worlds)) return payload.regular_worlds
  if (Array.isArray(payload.worlds)) return payload.worlds
  return []
}

async function getWorldMeta(worldName?: string): Promise<WorldMeta | undefined> {
  const key = (worldName ?? '').trim().toLowerCase()
  if (!key) return undefined
  const now = Date.now()
  const hit = worldMetaCache.get(key)
  if (hit && now - hit.at < WORLD_META_TTL) return hit.meta
  try {
    const payload = await getWorlds()
    const list = extractWorldList(payload)
    const meta = list.find((world) => world.name?.toLowerCase() === key)
    worldMetaCache.set(key, { at: now, meta })
    return meta
  } catch (err) {
    console.error('[marketService] failed to load world meta', err)
    worldMetaCache.set(key, { at: now, meta: undefined })
    return undefined
  }
}

function normalizeBattleye(meta?: WorldMeta): 'green' | 'yellow' | undefined {
  if (!meta) return undefined
  const raw = (meta.battleye_status ?? meta.battleye ?? '').toString().toLowerCase()
  if (!raw) return undefined
  if (raw.includes('protected') || raw === 'on') return 'green'
  if (raw.includes('unprotected') || raw === 'off') return 'yellow'
  return undefined
}

function normalizeLocation(meta?: WorldMeta): string | undefined {
  if (!meta?.location) return undefined
  const raw = meta.location.toString().trim().toUpperCase()
  if (!raw) return undefined
  if (raw.startsWith('E')) return 'EU'
  if (raw.startsWith('N')) return 'NA'
  if (raw.startsWith('S') || raw.startsWith('B')) return 'BR'
  if (raw.startsWith('O')) return 'OCE'
  return raw
}

function normalizePvp(meta?: WorldMeta): string | undefined {
  const raw = (meta?.pvp_type ?? meta?.pvpType ?? '').toString()
  if (!raw) return undefined
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---- Parser principal ----
function parseAuctions(html: string): Auction[] {
  if (!html) return []
  let auctions: Auction[] = []

  if (!looksLikeMarkdown(html)) {
    const $: CheerioInstance = cheerio.load(html)
    $('.Auction, .AuctionElement, .CharacterAuction').each((_, el: cheerio.Element) => {
      const root = $(el)

      const name =
        root.find('a[href*="charactertrade"]').first().text().trim() ||
        root.find('.AuctionCharacterName, .AuctionName, .AuctionHeader .Text').first().text().trim()

      const levelMatch = root.text().match(/Level\s*:?[\s]*([0-9]+)/i)
      const level = levelMatch ? Number(levelMatch[1]) : 0

      let vocation =
        root.find('.AuctionCharacterVocation, .AuctionVocation').first().text().trim() || ''
      if (!vocation) {
        const vm = root.text().match(/Vocation\s*:?[\s]*([A-Za-z ]+)/i)
        vocation = (vm?.[1] ?? '').trim()
      }

      let world = root.find('.AuctionCharacterWorld, .AuctionWorld').first().text().trim() || ''
      if (!world) {
        const wm = root.text().match(/World\s*:?[\s]*([A-Za-z\- ]+)/i)
        world = (wm?.[1] ?? '').trim()
      }
      world = world.replace(/Auction\s*Start|Server\s*|World\s*:?\s*/gi, '').trim()

      const bidNode = root.find('.AuctionCurrentBid, .AuctionBid, .AuctionMinimalBid').first()
      const bidText = root.find('.ShortAuctionDataBidRow').text() || bidNode.text() || root.text()
      const bidAmount = pickFirstNumber(bidText)
      const hasBid = /Current\s*Bid|Winning\s*Bid|Current\s*offer/i.test(bidText)
      const currentBid = hasBid ? bidAmount : bidAmount
      const minimumBid = hasBid ? bidAmount : bidAmount

      const endNode = root.find('.AuctionEnd, .AuctionEndsIn, .AuctionEndDate').first()
      const endTime = (endNode.text() || '').trim()

      let url =
        root.find('a[href*="charactertrade"]').first().attr('href') ||
        root.find('a[href*="characters"]').first().attr('href') ||
        ''
      url = absolutize(url) || 'https://www.tibia.com/charactertrade/'

      let portrait =
        root.find('img[src*="outfit"], img[src*="portrait"], img.OutfitImage').first().attr('src') ||
        root.find('img').first().attr('src') ||
        ''
      portrait = absolutize(portrait)
      const idMatch = url.match(/auctionid=(\d+)/i)
      const id = idMatch ? Number(idMatch[1]) : null

      auctions.push({
        id,
        name,
        level,
        vocation,
        world,
        currentBid,
        minimumBid,
        hasBid,
        endTime,
        url,
        portrait,
      })
    })
  }

  if (auctions.length) return auctions
  if (looksLikeMarkdown(html)) {
    const parsed = parseMarkdownAuctions(html)
    if (parsed.length) return parsed
  }
  if (looksLikeCloudflare(html) || !auctions.length) {
    if (!fallbackAuctionsLogged) {
      console.warn('[marketService] using fallback auctions list')
      fallbackAuctionsLogged = true
    }
    return FALLBACK_AUCTIONS
  }
  return auctions
}

function filterFallbackAuctions(filters: BazaarFilters): Auction[] {
  const { world, vocation, minLevel, maxLevel, order = 'end', sort = 'asc' } = filters
  const normalizedWorld = world?.trim().toLowerCase()
  const normalizedVoc = vocation?.trim().toLowerCase()

  const filtered = FALLBACK_AUCTIONS.filter((auction) => {
    if (normalizedWorld && auction.world.toLowerCase() !== normalizedWorld) return false
    if (normalizedVoc && !auction.vocation.toLowerCase().includes(normalizedVoc)) return false
    if (typeof minLevel === 'number' && auction.level < minLevel) return false
    if (typeof maxLevel === 'number' && auction.level > maxLevel) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let aValue = 0
    let bValue = 0
    if (order === 'price') {
      aValue = a.hasBid ? a.currentBid : a.minimumBid
      bValue = b.hasBid ? b.currentBid : b.minimumBid
    } else if (order === 'level') {
      aValue = a.level
      bValue = b.level
    } else {
      aValue = Date.parse(a.endTime)
      bValue = Date.parse(b.endTime)
    }
    return sort === 'desc' ? bValue - aValue : aValue - bValue
  })

  return sorted
}

function getLabelValue($: CheerioInstance, label: string): string {
  const selector = `.LabelV:contains("${label}")`
  const el = $(selector).first()
  if (!el.length) return ''
  return el.next().text().trim()
}

function parseStoreItems($: CheerioInstance): StoreItem[] {
  const items: StoreItem[] = []
  $('#StoreItemSummary .TableContent tbody .CVIcon').each((_, element: cheerio.Element) => {
    const title = $(element).attr('title') || ''
    if (!title) return
    let amount = 1
    const match = title.match(/^([\d.,]+)x\s+/i)
    let nameText = title
    if (match) {
      amount = pickFirstNumber(match[1])
      nameText = title.substring(match[0].length)
    }
    const [rawName] = nameText.split('\n')
    const name = rawName?.trim()
    if (name) {
      items.push({ name, amount: Number.isFinite(amount) ? amount : 1 })
    }
  })
  return items
}

function parseItems($: CheerioInstance): number[] {
  const list: number[] = []
  $('.AuctionItemsViewBox .CVIcon').each((_, element: cheerio.Element) => {
    const img = $('img', element).first()
    const src = img.attr('src') || ''
    const match = src.match(/objects\/(\d+)/i)
    if (!match) return
    let value = Number(match[1])
    const tierImg = $('.ObjectTier img', element).attr('src') || ''
    const tierMatch = tierImg.match(/tiers\/(\d+)/i)
    if (tierMatch) {
      value += Number(tierMatch[1]) / 10
    }
    list.push(value)
  })
  return list
}

function parseListEntries($: CheerioInstance, selector: string): string[] {
  const skipClasses = new Set(['IndicateMoreEntries', 'LabelH'])
  const entries: string[] = []
  $(selector).each((_, element: cheerio.Element) => {
    const parent = $(element).parent()
    const parentClasses = (parent.attr('class') || '').split(/\s+/)
    if (parentClasses.some((cls: string) => skipClasses.has(cls))) return
    const text = $(element).text().trim()
    if (text) entries.push(text)
  })
  return entries
}

function parseHirelings($: CheerioInstance): HirelingInfo | undefined {
  const count = pickFirstNumber(getLabelValue($, 'Hirelings:'))
  const jobs = pickFirstNumber(getLabelValue($, 'Hireling Jobs:'))
  const outfits = pickFirstNumber(getLabelValue($, 'Hireling Outfits:'))
  if (!count && !jobs && !outfits) return undefined
  return { count, jobs, outfits }
}

function parseGems($: CheerioInstance): GemsInfo | undefined {
  const counts: GemsInfo = { lesser: 0, regular: 0, greater: 0 }
  let found = false
  $('#RevealedGems .Gem').each((_, element: cheerio.Element) => {
    found = true
    const title = $(element).attr('title')?.toLowerCase() ?? ''
    if (title.includes('greater')) counts.greater += 1
    else if (title.includes('lesser')) counts.lesser += 1
    else counts.regular += 1
  })
  return found ? counts : undefined
}

function parseGreaterGems($: CheerioInstance): string[] | undefined {
  const list = new Set<string>()
  $('#RevealedGems td:nth-child(2) .ModEffectRow .ModIconCharBazaarSupremeMod + span').each(
    (_, element: cheerio.Element) => {
      const iconName = $(element).children().first().text().trim()
      const detail = $(element).children().eq(2).text().trim()
      const label = detail ? `${iconName} (${detail})` : iconName
      if (label) list.add(label)
    }
  )
  if (!list.size) return undefined
  return Array.from(list).sort()
}

function parseCharmInfo($: CheerioInstance): CharmInfo | undefined {
  const available = pickFirstNumber(getLabelValue($, 'Available Charm Points:'))
  const spent = pickFirstNumber(getLabelValue($, 'Spent Charm Points:'))
  if (!available && !spent) return undefined
  const total = available + spent
  const expansion =
    getLabelValue($, 'Charm Expansion:').toLowerCase() === 'yes'
  return { total, expansion }
}

function parseMinimumBid($: CheerioInstance, pageText: string): number | undefined {
  const rowText = $('.ShortAuctionDataBidRow').text()
  if (/Minimum\s*Bid/i.test(rowText)) {
    const fromRow = pickFirstNumber(rowText)
    if (fromRow) return fromRow
  }
  const fallbackMatch = pageText.match(/Minimum\s+Bid\s*:?\s*([\d.,]+)/i)
  if (fallbackMatch) return pickFirstNumber(fallbackMatch[0])
  const bidValue = pickFirstNumber(rowText)
  return bidValue || undefined
}

// ---- Busca nível via TibiaData ----
async function getLevelFromTibiaData(name: string): Promise<number> {
  const key = name.toLowerCase()
  const hit = levelCache.get(key)
  const now = Date.now()
  if (hit && now - hit.at < LEVEL_CACHE_TTL) return hit.level
  try {
    const data = await TibiaDataClient.character(name)
    const c: any =
      (data as any).character ??
      (data as any).characters?.character ??
      (data as any).data?.character ??
      data
    const level = Number(c?.level) || 0
    levelCache.set(key, { at: now, level })
    return level
  } catch {
    return 0
  }
}

async function hydrateLevels(auctions: Auction[]): Promise<Auction[]> {
  const out = [...auctions]
  let i = 0
  while (i < out.length) {
    const batch = out.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (a) => {
        if (!a.name) return
        if (a.level && a.level > 0) return
        const lvl = await getLevelFromTibiaData(a.name)
        a.level = lvl || a.level || 0
      })
    )
    i += CONCURRENCY
  }
  return out
}

// ---- Pega detalhes da página individual ----
async function fetchAuctionDetails(auction: Auction): Promise<Partial<Auction>> {
  const url = auction.url
  const key = `detail:${url}`
  const now = Date.now()
  const hit = detailCache.get(key)
  if (hit && now - hit.at < DETAIL_CACHE_TTL) return hit.data
  let html = ''
  try {
    html = await fetchBazaarHtml(url)
  } catch (err) {
    const reason = axios.isAxiosError(err)
      ? err.code ?? err.response?.status ?? err.message
      : String(err)
    console.warn('[marketService] detail fetch failed', { url, reason })
    detailCache.set(key, { at: now, data: {} })
    return {}
  }
  if (!html) {
    detailCache.set(key, { at: now, data: {} })
    return {}
  }
  if (looksLikeMarkdown(html)) {
    if (!markdownDetailSnippetLogged) {
      console.warn('[marketService] markdown detail snippet', {
        url,
        snippet: html.slice(0, 2000),
      })
      markdownDetailSnippetLogged = true
    }
    return {}
  }

  const $: CheerioInstance = cheerio.load(html)
  const pageText = $('body').text()

  const detailName =
    $('.AuctionCharacterName, .AuctionName, .AuctionHeader .Text').first().text().trim() ||
    extractString(pageText, /Character\s+Name\s*:?\s*([A-Za-z' -]+)/i)

  const charmInfo = parseCharmInfo($)
  const charmPoints = charmInfo?.total ?? pickFirstNumber(pageText.match(/Charm\s*points.*?(\d+)/i)?.[0] ?? '')
  const bossPoints =
    pickFirstNumber(getLabelValue($, 'Boss Points:')) ||
    pickFirstNumber(pageText.match(/Boss\s*points.*?(\d+)/i)?.[0] ?? '')

  const skills: Skills = {}
  const grab = (label: string, key: keyof Skills) => {
    const re = new RegExp(`${label}\\s*[:\\-]?\\s*([\\d.,]+)`, 'i')
    const m = pageText.match(re)
    if (m) (skills as any)[key] = pickFirstNumber(m[0])
  }

  grab('Magic', 'magic')
  grab('Club', 'club')
  grab('Sword', 'sword')
  grab('Axe', 'axe')
  grab('Distance', 'distance')
  grab('Shielding', 'shielding')
  grab('Fishing', 'fishing')
  grab('Fist', 'fist')

  const storeItems = parseStoreItems($)
  const items = parseItems($)
  const imbuements = parseListEntries($, '#Imbuements .TableContentContainer tbody td')
  const quests = Array.from(
    new Set([
      ...parseListEntries($, '#Achievements .TableContentContainer tbody td'),
      ...parseListEntries($, '#CompletedQuestLines .TableContentContainer tbody td'),
    ])
  )
  const hirelings = parseHirelings($)
  const gems = parseGems($)
  const greaterGems = parseGreaterGems($)
  const preySlot = getLabelValue($, 'Permanent Prey Slots:').includes('1')
  const huntingSlot = getLabelValue($, 'Permanent Hunting Task Slots:').includes('1')
  const transferText = getLabelValue($, 'Regular World Transfer:')
  const transfer = transferText.toLowerCase().includes('can be purchased')
  const minimumBid = parseMinimumBid($, pageText) ?? auction.minimumBid
  const meta = await getWorldMeta(auction.world)

  const data: Partial<Auction> = {
    name: detailName || auction.name,
    charmPoints,
    charmInfo,
    bossPoints,
    skills,
    storeItems: storeItems.length ? storeItems : undefined,
    items: items.length ? items : undefined,
    imbuements: imbuements.length ? imbuements : undefined,
    quests: quests.length ? quests : undefined,
    hirelings,
    gems,
    greaterGems,
    preySlot,
    huntingSlot,
    transfer,
    minimumBid: Number.isFinite(minimumBid) ? minimumBid : auction.minimumBid,
    battleye: normalizeBattleye(meta),
    pvpType: normalizePvp(meta),
    serverLocation: normalizeLocation(meta),
  }
  detailCache.set(key, { at: now, data })
  return data
}

function needsDetailHydration(auction: Auction): boolean {
  if (!auction.url) return false
  const hasSkills = auction.skills && Object.keys(auction.skills).length > 0
  const hasItems = Array.isArray(auction.items) && auction.items.length > 0
  const hasStoreItems = Array.isArray(auction.storeItems) && auction.storeItems.length > 0
  const hasImbuements = Array.isArray(auction.imbuements) && auction.imbuements.length > 0
  const hasQuests = Array.isArray(auction.quests) && auction.quests.length > 0
  const hasGems = Boolean(auction.gems || (auction.greaterGems && auction.greaterGems.length))
  const hasHirelings = Boolean(
    auction.hirelings && (auction.hirelings.count || auction.hirelings.jobs || auction.hirelings.outfits),
  )
  const hasCharm = Boolean(auction.charmInfo || typeof auction.charmPoints === 'number')
  const hasBossPoints = typeof auction.bossPoints === 'number'
  const hasTags = Array.isArray(auction.tags) && auction.tags.length > 0
  const hasTcInvested = typeof auction.tcInvested === 'number'

  return !(
    hasSkills ||
    hasItems ||
    hasStoreItems ||
    hasImbuements ||
    hasQuests ||
    hasGems ||
    hasHirelings ||
    hasCharm ||
    hasBossPoints ||
    hasTags ||
    hasTcInvested
  )
}

async function hydrateDetails(auctions: Auction[]): Promise<Auction[]> {
  const out = [...auctions]
  let i = 0
  while (i < out.length) {
    const batch = out.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (a) => {
        if (!a.url) return
        try {
          const det = await fetchAuctionDetails(a)
          Object.assign(a, det)
        } catch (err) {
          console.error(`[hydrateDetails] erro em ${a.name}:`, err)
        }
      })
    )
    i += CONCURRENCY
  }
  return out
}

async function hydrateDetailsIfNeeded(auctions: Auction[]): Promise<Auction[]> {
  if (!auctions.some((auction) => needsDetailHydration(auction))) {
    return auctions
  }
  return hydrateDetails(auctions)
}

async function enrichAuctions(auctions: Auction[]): Promise<Auction[]> {
  const hydratedLvl = await hydrateLevels(auctions)
  return hydrateDetailsIfNeeded(hydratedLvl)
}

// ---- API pública segura ----
export type GetAuctionsResult = { auctions: Auction[]; totalPages?: number }

export async function getAuctions(filters: BazaarFilters): Promise<GetAuctionsResult> {
  const key = cacheKey(filters)
  const hit = listCache.get(key)
  const now = Date.now()

  if (hit && now - hit.at < LIST_CACHE_TTL) {
    const hydrated = await enrichAuctions(hit.data)
    return { auctions: hydrated, totalPages: 1 }
  }

  let tibiaBlocked = false

  try {
    const url = buildBazaarUrl(filters)
    const html = await fetchBazaarHtml(url)
    const auctions = parseAuctions(html)
    const placeholderResult = auctions === FALLBACK_AUCTIONS

    if (!auctions.length && !placeholderResult) {
      const snippet = html.toString().replace(/\s+/g, ' ').slice(0, 5000)
      console.warn('[marketService] bazaar returned empty list', { url, snippet })
    }

    if (!placeholderResult) {
      let totalPages = 1
      try {
        const $: CheerioInstance = cheerio.load(html)
        const paginationText = $('.PageNavigation').text()
        const matches = paginationText.match(/\d+/g)
        if (matches && matches.length > 0) {
          const numbers = matches.map((n: string) => parseInt(n, 10))
          totalPages = Math.max(...numbers)
        }
      } catch {
        totalPages = 1
      }

      const hydrated = await enrichAuctions(auctions)
      listCache.set(key, { at: now, data: hydrated })
      return { auctions: hydrated, totalPages }
    }

    tibiaBlocked = true
    console.warn('[marketService] tibia bazaar blocked, switching to exevo pan', { url })
  } catch (err) {
    console.error('[marketService] upstream error:', err)
  }

  const exevoResult = await fetchExevoPanAuctions(filters)
  if (exevoResult) {
    const hydrated = await enrichAuctions(exevoResult.auctions)
    listCache.set(key, { at: now, data: hydrated })
    return { auctions: hydrated, totalPages: exevoResult.totalPages }
  }

  if (hit) {
    console.warn('[marketService] falling back to stale cached bazaar data')
    return { auctions: hit.data, totalPages: 1 }
  }

  const fallback = filterFallbackAuctions(filters)
  if (!tibiaBlocked) {
    console.warn('[marketService] using static fallback auctions list')
  }
  return { auctions: fallback, totalPages: 1 }
}
