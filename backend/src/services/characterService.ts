import axios from 'axios'
import * as cheerio from 'cheerio'
import type { CharacterSummary, CharacterExperienceHistory } from '../types/character'

type CheerioRoot = ReturnType<typeof cheerio.load>

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

  const rawWorld = getFieldRaw($, 'World:')
  const world =
    getFieldPrimary($, 'World:') ??
    (rawWorld ? rawWorld.replace(/Former World:.*/i, '').trim() || undefined : undefined)
  const vocation = getField($, 'Vocation:')
  const level = Number(getField($, 'Level:')) || 0
  const residence = getField($, 'Residence:')
  const sex = getField($, 'Sex:')
  const created = getField($, 'Created:')
  const guild = getField($, 'Guild membership:')
  const lastLogin = normalizeTibiaDate(getField($, 'Last Login:')) ?? undefined
  const accountStatus = getField($, 'Account Status:')
  const house = getField($, 'House:')
  const comment = getField($, 'Comment:')
  const formerNames = getField($, 'Former Names:')
  const rawTitle = getFieldRaw($, 'Title:')
  const title = getFieldPrimary($, 'Title:') ?? (rawTitle ? rawTitle.replace(/Loyalty Title:.*/i, '').trim() : undefined)
  const loyaltyTitle = getField($, 'Loyalty Title:')
  const formerWorld =
    getField($, 'Former World:') ??
    (() => {
      const match = rawWorld?.match(/Former World:\s*(.+)$/i)
      return match?.[1]?.trim()
    })()
  const achievementPoints = Number(getField($, 'Achievement Points:')) || undefined

  const deaths: CharacterSummary['deaths'] = []
  $('#CharacterDeaths .TableContent tr').each((_, row) => {
    const columns = $(row).find('td')
    if (columns.length < 2) return
    const date = $(columns[0]).text().trim()
    const description = $(columns[1]).text().trim()
    if (!date || !description || /There are no/gi.test(description)) return
    const match = description.match(/level\s+(\d+)/i)
    deaths.push({
      time: normalizeTibiaDate(date),
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
    created: normalizeTibiaDate(created) ?? undefined,
    lastLogin,
    accountStatus,
    house,
    comment,
    formerNames,
    title: title || loyaltyTitle || undefined,
    formerWorld,
    achievementPoints,
    deaths,
  }
}

function normalizeTibiaDate(raw?: string | null) {
  if (!raw) return null
  const value = raw.trim()
  if (!value) return null
  const replaced = value
    .replace(/CET/g, 'GMT+0100')
    .replace(/CEST/g, 'GMT+0200')
    .replace(/\(.*?\)/g, '')
    .trim()
  const date = new Date(replaced)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString()
}

function normalizeLabel(text: string) {
  return text.replace(/\s+/g, ' ').trim().replace(/:\s*$/, '').toLowerCase()
}

function findLabelCell($: CheerioRoot, label: string) {
  const target = normalizeLabel(label)
  return $('td')
    .filter((_, el) => normalizeLabel($(el).text()) === target)
    .first()
}

function getFieldRaw($: CheerioRoot, label: string) {
  const cell = findLabelCell($, label)
  if (!cell.length) return undefined
  const next = cell.next()
  if (!next.length) return undefined
  return next.text()
}

function getField($: CheerioRoot, label: string) {
  const raw = getFieldRaw($, label)
  if (!raw) return undefined
  const value = raw.replace(/\s+/g, ' ').trim()
  return value || undefined
}

function getFieldPrimary($: CheerioRoot, label: string) {
  const cell = findLabelCell($, label)
  if (!cell.length) return undefined
  const next = cell.next()
  if (!next.length) return undefined
  const firstText = next
    .contents()
    .map((_, node) => (node.type === 'text' ? (node.data ?? '').trim() : ''))
    .get()
    .find((text) => text.length > 0)
  if (firstText) return firstText
  return next.text().trim() || undefined
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
