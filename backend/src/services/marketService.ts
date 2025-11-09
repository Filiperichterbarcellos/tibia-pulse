import axios from 'axios'
import * as cheerio from 'cheerio'
import type { Auction } from '../types/market'

type Filters = {
  world?: string
  vocation?: string
  minLevel?: number
  maxLevel?: number
  page?: number
  order?: 'price' | 'level' | 'end'
  sort?: 'asc' | 'desc'
}

const CACHE_TTL = 60_000 // 60s
const cache = new Map<string, { at: number; data: Auction[] }>()

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

/**
 * Monta a URL do bazar oficial com filtros básicos.
 * Obs.: a URL real pode variar; ajustamos conforme necessidade.
 */
function buildBazaarUrl(f: Filters) {
  const params = new URLSearchParams()
  if (f.world) params.set('world', f.world)
  if (f.vocation) params.set('profession', f.vocation) // pode ser 'profession' no form
  if (f.minLevel) params.set('minlevel', String(f.minLevel))
  if (f.maxLevel) params.set('maxlevel', String(f.maxLevel))
  if (f.page) params.set('page', String(f.page))
  // ordenação (depende do site; placeholder):
  if (f.order) params.set('order', f.order)
  if (f.sort) params.set('sort', f.sort)

  // Página pública do Character Bazaar (lista de auctions)
  // Ajuste a rota exata se necessário
  return `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&${params.toString()}`
}

/**
 * Faz scraping simples dos cards de leilão.
 * Depois refinamos seletores para outfits/mounts etc.
 */
function parseAuctions(html: string): Auction[] {
  const $ = cheerio.load(html)

  const auctions: Auction[] = []

  // Seletores genéricos — podem precisar ajuste fino
  $('.Auction').each((_, el) => {
    const root = $(el)

    const name = root.find('.AuctionCharacterName, .AuctionName').text().trim()
    const levelText = root.find('.AuctionLevel, .AuctionCharacterLevel').text()
    const level = Number((levelText.match(/\d+/) || [0])[0])

    const vocation = root.find('.AuctionVocation, .AuctionCharacterVocation').text().trim()
    const world = root.find('.AuctionWorld, .AuctionCharacterWorld').text().trim()

    const priceText = root.find('.AuctionBid, .AuctionCurrentBid, .AuctionMinimalBid').text().replace(/[^\d]/g, '')
    const currentBid = Number(priceText || 0)
    const hasBid = /Current Bid|Current offer/i.test(root.text())

    const endText = root.find('.AuctionEnd, .AuctionEndsIn, .AuctionEndDate').text().trim()
    // Não forçamos parse aqui; devolvemos string
    const endTime = endText

    const url = root.find('a').attr('href') || 'https://www.tibia.com/charactertrade/'

    auctions.push({
      name,
      level,
      vocation,
      world,
      currentBid,
      hasBid,
      endTime,
      url,
    })
  })

  return auctions
}

export async function getAuctions(filters: Filters): Promise<Auction[]> {
  const key = cacheKey(filters)
  const hit = cache.get(key)
  const now = Date.now()
  if (hit && now - hit.at < CACHE_TTL) return hit.data

  const url = buildBazaarUrl(filters)
  const { data: html } = await axios.get(url, { timeout: 15_000 })

  const auctions = parseAuctions(html)
  cache.set(key, { at: now, data: auctions })
  return auctions
}
