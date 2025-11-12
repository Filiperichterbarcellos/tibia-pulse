import axios from 'axios'
import * as cheerio from 'cheerio'
import type { CharacterSummary, CharacterExperienceHistory } from '../types/character'

const BASE_URL = 'https://www.tibia.com/community/?subtopic=characters&name='
const ALL_ORIGINS = 'https://api.allorigins.win/raw?url='
const JINA_PROXY = 'https://r.jina.ai/'

const DIRECT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Tibia Pulse)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://www.tibia.com/community/?subtopic=characters',
}

const RETRIABLE_CODES = new Set(['EAI_AGAIN', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'])

function shouldRetry(err: unknown) {
  if (!axios.isAxiosError(err)) return false
  const status = err.response?.status ?? 0
  if (status === 403 || status === 429 || status === 503) return true
  if (!err.response && err.code && RETRIABLE_CODES.has(err.code)) return true
  return false
}

async function fetchTibiaPage(url: string): Promise<string> {
  try {
    const { data } = await axios.get<string>(url, { headers: DIRECT_HEADERS, timeout: 8000 })
    if (typeof data === 'string' && !data.includes('cf-error-details')) return data
    console.warn('[characters] possible cloudflare challenge, retry via proxy', { url })
  } catch (err) {
    if (!shouldRetry(err)) throw err
    console.warn('[characters] direct fetch blocked, trying proxies', {
      url,
      reason: axios.isAxiosError(err) ? err.response?.status ?? err.code : String(err),
    })
  }

  try {
    const { data } = await axios.get<string>(`${ALL_ORIGINS}${encodeURIComponent(url)}`, {
      timeout: 10000,
    })
    if (typeof data === 'string' && data.trim()) return data
  } catch (err) {
    console.warn('[characters] allorigins proxy failed', {
      url,
      reason: axios.isAxiosError(err) ? err.response?.status ?? err.code : String(err),
    })
  }

  const proxiedUrl = `${JINA_PROXY}${url}`
  const { data } = await axios.get<string>(proxiedUrl, { timeout: 15000 })
  return typeof data === 'string' ? data : String(data ?? '')
}

export async function fetchCharacterProfile(name: string): Promise<CharacterSummary> {
  const url = `${BASE_URL}${encodeURIComponent(name)}`
  const data = await fetchTibiaPage(url)
  const $ = cheerio.load(data)

  const nameLabel = $('td:contains("Name:")').next().text().trim()
  if (!nameLabel) {
    const title = $('title').text()
    if (title.includes('Character Information')) {
      throw Object.assign(new Error('not-found'), { code: 404 })
    }
  }

  const world = $('td:contains("World:")').next().text().trim() || undefined
  const vocation = $('td:contains("Vocation:")').next().text().trim() || undefined
  const level = Number($('td:contains("Level:")').next().text().trim()) || 0
  const residence = $('td:contains("Residence:")').next().text().trim() || undefined
  const sex = $('td:contains("Sex:")').next().text().trim() || undefined
  const created = $('td:contains("Created:")').next().text().trim() || undefined
  const guild = $('td:contains("Guild membership:")').next().text().trim() || undefined
  const lastLogin = $('td:contains("Last Login:")').next().text().trim() || undefined
  const accountStatus = $('td:contains("Account Status:")').next().text().trim() || undefined
  const house = $('td:contains("House:")').next().text().trim() || undefined
  const comment = $('td:contains("Comment:")').next().text().trim() || undefined
  const formerNames = $('td:contains("Former Names:")').next().text().trim() || undefined
  const title = $('td:contains("Title:")').next().text().trim() || undefined
  const formerWorld = $('td:contains("Former World:")').next().text().trim() || undefined
  const achievementPoints = Number($('td:contains("Achievement Points:")').next().text().trim()) || undefined

  const deaths: CharacterSummary['deaths'] = []
  $('#CharacterDeaths .TableContent tbody tr').each((_, row) => {
    const columns = $(row).find('td')
    if (!columns.length) return
    const date = $(columns[0]).text().trim()
    const description = $(columns[1]).text().trim()
    const match = description.match(/level (\d+)/i)
    deaths.push({
      time: date ? new Date(date).toISOString() : null,
      level: match ? Number(match[1]) : 0,
      reason: description,
    })
  })

  return {
    name: nameLabel || name,
    world,
    vocation,
    level,
    residence,
    guild,
    sex,
    created,
    lastLogin,
    accountStatus,
    house,
    comment,
    formerNames,
    title,
    formerWorld,
    achievementPoints,
    deaths,
  }
}

export type GuildStatsSummary = {
  currentXP: number
  bestDay?: { date: string; value: number }
  averageDaily?: number
  history: CharacterExperienceHistory[]
}

export async function fetchGuildStats(name: string): Promise<GuildStatsSummary | null> {
  const url = `https://guildstats.eu/player/${encodeURIComponent(name)}`
  const { data } = await axios.get<string>(url, { timeout: 15_000 })
  const $ = cheerio.load(data)

  const currentXP = Number($('#stat_current_xp').text().replace(/[^\d]/g, '')) || 0
  if (!currentXP) return null

  const bestDayValue = Number($('#stat_best_day').text().replace(/[^\d]/g, '')) || 0
  const bestDayDate = $('#stat_best_day').closest('tr').find('td').eq(1).text().trim()

  const averageDaily = Number($('#stat_avg_daily').text().replace(/[^\d]/g, '')) || 0

  const history: CharacterExperienceHistory[] = []
  $('#expchart table tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 5) return
    const date = $(cells[0]).text().trim()
    const expChange = Number($(cells[1]).text().replace(/[^\d-]/g, '')) || 0
    const levelChange = $(cells[2]).text().trim()
    const level = Number(levelChange.replace(/\D/g, '')) || 0
    history.push({ date, expChange, level })
  })

  return {
    currentXP,
    bestDay: bestDayValue ? { date: bestDayDate, value: bestDayValue } : undefined,
    averageDaily: averageDaily || undefined,
    history,
  }
}
