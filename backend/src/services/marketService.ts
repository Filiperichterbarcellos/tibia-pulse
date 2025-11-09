import axios from 'axios'
import * as cheerio from 'cheerio'
import type { Auction, Skills } from '../types/market'
import { TibiaDataClient } from './tibiadata'

type Filters = {
  world?: string
  vocation?: string
  minLevel?: number
  maxLevel?: number
  page?: number
  order?: 'price' | 'level' | 'end'
  sort?: 'asc' | 'desc'
}

// ---- Caches ----
const LIST_CACHE_TTL = 60_000
const listCache = new Map<string, { at: number; data: Auction[] }>()
const DETAIL_CACHE_TTL = 10 * 60_000
const detailCache = new Map<string, { at: number; data: Partial<Auction> }>()
const LEVEL_CACHE_TTL = 10 * 60_000
const levelCache = new Map<string, { at: number; level: number }>()
const CONCURRENCY = 4

// ---- Utils ----
function cacheKey(f: Filters) {
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

function buildBazaarUrl(f: Filters) {
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

function absolutize(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://www.tibia.com${url}`
  return url
}

// ---- Parser principal ----
function parseAuctions(html: string): Auction[] {
  const $ = cheerio.load(html)
  const auctions: Auction[] = []

  $('.Auction, .AuctionElement, .CharacterAuction').each((_, el) => {
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
    const bidText = bidNode.text() || root.text()
    const currentBid = pickFirstNumber(bidText)
    const hasBid = /Current\s*Bid|Current\s*offer/i.test(bidText)

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

    auctions.push({
      name,
      level,
      vocation,
      world,
      currentBid,
      hasBid,
      endTime,
      url,
      portrait,
    })
  })

  return auctions
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
async function fetchAuctionDetails(url: string): Promise<Partial<Auction>> {
  const key = `detail:${url}`
  const now = Date.now()
  const hit = detailCache.get(key)
  if (hit && now - hit.at < DETAIL_CACHE_TTL) return hit.data

  const { data: html } = await axios.get(url, { timeout: 15_000 })
  const $ = cheerio.load(html)
  const pageText = $('body').text()

  const charmPoints = pickFirstNumber(pageText.match(/Charm\s*points.*?(\d+)/i)?.[0] ?? '')
  const bossPoints = pickFirstNumber(pageText.match(/Boss\s*points.*?(\d+)/i)?.[0] ?? '')

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

  const data: Partial<Auction> = { charmPoints, bossPoints, skills }
  detailCache.set(key, { at: now, data })
  return data
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
          const det = await fetchAuctionDetails(a.url)
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

// ---- API pública segura ----
export type GetAuctionsResult = { auctions: Auction[]; totalPages?: number }

export async function getAuctions(filters: Filters): Promise<GetAuctionsResult> {
  const key = cacheKey(filters)
  const hit = listCache.get(key)
  const now = Date.now()

  if (hit && now - hit.at < LIST_CACHE_TTL) {
    const hydratedLvl = await hydrateLevels(hit.data)
    const hydrated = await hydrateDetails(hydratedLvl)
    return { auctions: hydrated, totalPages: 1 }
  }

  try {
    const url = buildBazaarUrl(filters)
    const { data: html } = await axios.get(url, { timeout: 15_000 })
    const auctions = parseAuctions(html)

    let totalPages = 1
    try {
      const $ = cheerio.load(html)
      const paginationText = $('.PageNavigation').text()
      const matches = paginationText.match(/\d+/g)
      if (matches && matches.length > 0) {
        const numbers = matches.map((n) => parseInt(n))
        totalPages = Math.max(...numbers)
      }
    } catch {
      totalPages = 1
    }

    const hydratedLvl = await hydrateLevels(auctions)
    const hydrated = await hydrateDetails(hydratedLvl)

    listCache.set(key, { at: now, data: hydrated })
    return { auctions: hydrated, totalPages }
  } catch (err) {
    console.error('[marketService] upstream error:', err)
    if (hit) return { auctions: hit.data, totalPages: 1 }
    return { auctions: [], totalPages: 1 }
  }
}
