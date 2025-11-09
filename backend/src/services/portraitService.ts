import axios from 'axios'
import * as cheerio from 'cheerio'

const portraitCache = new Map<string, { url: string; at: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hora

export async function fetchPortrait(auctionUrl: string): Promise<string | null> {
  try {
    const hit = portraitCache.get(auctionUrl)
    const now = Date.now()
    if (hit && now - hit.at < CACHE_TTL) return hit.url

    const { data: html } = await axios.get(auctionUrl, {
      headers: { 'User-Agent': 'TibiaPulseBot/1.0 (+github.com/tibia-pulse)' },
      timeout: 10000,
    })

    const $ = cheerio.load(html)

    // Seletor da imagem na página do leilão
    const src =
      $('img.CharacterOutfitImage').attr('src') ||
      $('img.OutfitImage').attr('src') ||
      $('.AuctionCharacterImage img').attr('src') ||
      null

    if (!src) return null

    const portraitUrl = src.startsWith('http')
      ? src
      : new URL(src, 'https://www.tibia.com').toString()

    portraitCache.set(auctionUrl, { url: portraitUrl, at: now })
    return portraitUrl
  } catch (err) {
    return null
  }
}
