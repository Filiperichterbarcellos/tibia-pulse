import axios from 'axios'
import * as cheerio from 'cheerio'
import type {
  CharacterSummary,
  CharacterExperienceHistory,
  PulseStatsSummary,
  PulseStatsLevelHistoryEntry,
  PulseStatsTimeOnlineSummary,
  PulseStatsHighscoreEntry,
  PulseStatsDeathEntry,
} from '../types/character'

type CheerioRoot = ReturnType<typeof cheerio.load>

const BASE_URL = 'https://www.tibia.com/community/?subtopic=characters&name='
const ALL_ORIGINS = 'https://api.allorigins.win/raw?url='
const JINA_PROXY = 'https://r.jina.ai/'

const STATS_BASE = 'https://guildstats.eu/character'
const STATS_HISTORY_URL = 'https://guildstats.eu/include/pagiationHistory_data.php'
const STATS_DEATH_URL = 'https://guildstats.eu/include/pagiationDeath_data.php'
const STATS_TIMEOUT = 15000
const TRACKER_PROXY_BASE = process.env.TRACKER_PROXY_URL
  ? process.env.TRACKER_PROXY_URL.trim().replace(/\/$/, '')
  : undefined

const DIRECT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Tibia Pulse)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://www.tibia.com/community/?subtopic=characters',
}

const TRACKER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Tibia Pulse)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://guildstats.eu/',
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
    if (typeof data === 'string' && !data.includes('cf-error-details')) {
      console.info('[characters] tibia profile fetched via tibia.com')
      return data
    }
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
    if (typeof data === 'string' && data.trim()) {
      console.info('[characters] tibia profile fetched via allorigins proxy')
      return data
    }
  } catch (err) {
    console.warn('[characters] allorigins proxy failed', {
      url,
      reason: axios.isAxiosError(err) ? err.response?.status ?? err.code : String(err),
    })
  }

  const proxiedUrl = `${JINA_PROXY}${url}`
  const { data } = await axios.get<string>(proxiedUrl, { timeout: 15000 })
  console.info('[characters] tibia profile fetched via jina proxy')
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
  const inlineFormerWorld = extractInlineValue(rawWorld, 'Former World')
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
  const inlineLoyalty = extractInlineValue(rawTitle, 'Loyalty Title')
  const title =
    getFieldPrimary($, 'Title:') ??
    (rawTitle ? rawTitle.replace(/Loyalty Title:.*/i, '').trim() || undefined : undefined)
  const loyaltyTitle = getField($, 'Loyalty Title:')
  const formerWorld =
    getField($, 'Former World:') ??
    inlineFormerWorld
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
    title: title || undefined,
    loyaltyTitle: loyaltyTitle ?? inlineLoyalty ?? undefined,
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

function extractInlineValue(raw: string | undefined, label: string) {
  if (!raw) return undefined
  const regexp = new RegExp(`${label}\\s*:?\\s*(.+)$`, 'i')
  const match = raw.match(regexp)
  return match?.[1]?.trim() || undefined
}

function buildTrackerProxyUrl(targetUrl: string) {
  if (!TRACKER_PROXY_BASE) return null
  const separator = TRACKER_PROXY_BASE.includes('?') ? '&' : '?'
  return `${TRACKER_PROXY_BASE}${separator}url=${encodeURIComponent(targetUrl)}`
}

async function fetchTrackerHtml(targetUrl: string, context: string): Promise<string> {
  type Attempt = { label: string; exec: () => Promise<string> }
  const attempts: Attempt[] = []

  const proxyUrl = buildTrackerProxyUrl(targetUrl)
  if (proxyUrl) {
    attempts.push({
      label: 'proxy',
      exec: async () => {
        const { data } = await axios.get<string>(proxyUrl, { timeout: STATS_TIMEOUT })
        return data ?? ''
      },
    })
  }

  attempts.push({
    label: 'direct',
    exec: async () => {
      const { data } = await axios.get<string>(targetUrl, {
        timeout: STATS_TIMEOUT,
        headers: TRACKER_HEADERS,
      })
      return data ?? ''
    },
  })

  attempts.push({
    label: 'allorigins',
    exec: async () => {
      const { data } = await axios.get<string>(`${ALL_ORIGINS}${encodeURIComponent(targetUrl)}`, {
        timeout: STATS_TIMEOUT,
      })
      return data ?? ''
    },
  })

  attempts.push({
    label: 'jina',
    exec: async () => {
      const { data } = await axios.get<string>(`${JINA_PROXY}${targetUrl}`, {
        timeout: STATS_TIMEOUT,
      })
      return data ?? ''
    },
  })

  for (const attempt of attempts) {
    try {
      const html = await attempt.exec()
      if (typeof html === 'string' && html.trim()) {
        console.info(`[tracker] ${context} fetched via ${attempt.label}`)
        return html
      }
    } catch (err) {
      console.warn(`[tracker] ${context} request failed via ${attempt.label}`, {
        url: targetUrl,
        reason: axios.isAxiosError(err) ? err.response?.status ?? err.code : String(err),
      })
    }
  }

  return ''
}

async function fetchTrackerTab(name: string, tab?: number | string): Promise<string> {
  const query = [`nick=${encodeURIComponent(name)}`]
  if (typeof tab !== 'undefined') query.push(`tab=${tab}`)
  const url = `${STATS_BASE}?${query.join('&')}`
  const tabLabel = typeof tab === 'undefined' ? 'default' : String(tab)
  return fetchTrackerHtml(url, `tab-${tabLabel}:${name}`)
}

function isTrackerNotFound(html: string) {
  if (!html) return true
  return /Sorry! Guild or character does not exsists/i.test(html)
}

function parseExperienceHistory(html: string): CharacterExperienceHistory[] {
  if (!html) return []
  const $ = cheerio.load(html)
  const table = $('table')
    .filter((_, el) => {
      return (
        $(el)
          .find('th')
          .map((__, th) => $(th).text().trim().toLowerCase())
          .get()
          .includes('exp change')
      )
    })
    .first()

  if (!table.length) return []

  const entries: CharacterExperienceHistory[] = []
  table.find('tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 5) return
    const dateRaw = $(cells[0]).text().trim()
    if (!dateRaw) return

    const expChange = parseSignedInteger($(cells[1]).text()) ?? 0
    const rankInfo = parseRankCell($(cells[2]))
    const levelInfo = parseRankCell($(cells[3]))
    const experience = parseInteger($(cells[4]).text())
    const timeOnlineText = cells.length > 5 ? $(cells[5]).text().replace(/\s+/g, ' ').trim() : undefined
    const timeOnlineMinutes = parseDurationToMinutes(timeOnlineText)
    const averageExpPerHour = cells.length > 6 ? parseInteger($(cells[6]).text()) : undefined

    entries.push({
      date: normalizeTrackerDate(dateRaw) ?? dateRaw,
      expChange,
      level: levelInfo.value ?? 0,
      vocationRank: rankInfo.value,
      vocationRankDelta: rankInfo.delta,
      experience,
      timeOnlineText: timeOnlineText || undefined,
      timeOnlineMinutes,
      averageExpPerHour,
    })
  })

  return entries
}

function parseBestDay(html: string) {
  if (!html) return undefined
  const $ = cheerio.load(html)
  const table = $('table')
    .filter((_, el) => {
      const headers = $(el).find('th').map((__, th) => $(th).text().trim().toLowerCase()).get()
      return headers.some((text) => text.includes('best') && text.includes('day'))
    })
    .first()

  if (!table.length) return undefined
  const row = table
    .find('tr')
    .filter((_, tr) => $(tr).find('td').length >= 2)
    .first()
  const cells = row.find('td')
  if (cells.length < 2) return undefined
  const date = $(cells[0]).text().trim()
  const value = parseSignedInteger($(cells[1]).text())
  if (!date || typeof value === 'undefined') return undefined
  return { date: normalizeTrackerDate(date) ?? date, value }
}

function parseAverageDaily(html: string) {
  if (!html) return undefined
  const $ = cheerio.load(html)
  const raw = $('input[name="averageexp"]').attr('value') ?? $('input[name="averageexp"]').val()
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    const parsed = Number(raw.replace(/[^\d-]/g, ''))
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function parseTimeOnlineSummary(html: string): PulseStatsTimeOnlineSummary | undefined {
  if (!html) return undefined
  const $ = cheerio.load(html)
  const table = $('table')
    .filter((_, el) => {
      const firstHeader = $(el).find('th').first().text().trim().toLowerCase()
      return firstHeader.includes('last month')
    })
    .first()

  if (!table.length) return undefined
  const row = table.find('tr').filter((_, tr) => $(tr).find('td').length >= 3).first()
  if (!row.length) return undefined

  const cells = row.find('td')
  const headerCells = table.find('thead th')
  const weekdays: PulseStatsTimeOnlineSummary['weekdays'] = []
  for (let i = 3; i < cells.length; i += 1) {
    const headerLabel = headerCells.eq(i).text().trim()
    const cell = cells.eq(i)
    const raw = cell.text().replace(/\s+/g, ' ').trim()
    weekdays.push({
      label: headerLabel || `Day ${i - 2}`,
      raw: raw || undefined,
      durationMinutes: parseDurationToMinutes(raw),
      doubleEvent: cell.html()?.includes('doubleEvent') ?? false,
    })
  }

  const summary: PulseStatsTimeOnlineSummary = {
    lastMonth: cells.eq(0).text().trim() || undefined,
    currentMonth: cells.eq(1).text().trim() || undefined,
    currentWeek: cells.eq(2).text().trim() || undefined,
    weekdays: weekdays.length ? weekdays : undefined,
  }

  if (!summary.lastMonth && !summary.currentMonth && !summary.currentWeek && !summary.weekdays) {
    return undefined
  }
  return summary
}

function parseHighscores(html: string): PulseStatsHighscoreEntry[] | undefined {
  if (!html) return undefined
  const $ = cheerio.load(html)
  const table = $('table')
    .filter((_, el) => {
      const firstHeader = $(el).find('th').first().text().trim().toLowerCase()
      return firstHeader === 'skill'
    })
    .first()

  if (!table.length) return undefined
  const entries: PulseStatsHighscoreEntry[] = []
  table.find('tr').each((_, row) => {
    const cells = $(row).find('td')
    if (!cells.length) return
    const skill = cells.eq(0).text().replace(/:\s*$/, '').trim()
    if (!skill) return
    const value = cells.eq(1).text().trim()
    let position: number | undefined
    let link: string | undefined
    if (cells.length > 2) {
      position = parseInteger(cells.eq(2).text())
      link = absoluteTrackerUrl(cells.eq(2).find('a').attr('href'))
    } else {
      link = absoluteTrackerUrl(cells.eq(1).find('a').attr('href'))
    }
    entries.push({ skill, value, position, link })
  })

  return entries.length ? entries : undefined
}

function extractUidAndHistoryCounter(html: string) {
  if (!html) return { uid: undefined, historyCounter: undefined }
  const $ = cheerio.load(html)
  const historyCounter = $('#historyCounter').attr('value') ?? undefined
  const uidMatch = html.match(/UID=(\d+)/i)
  const uid = uidMatch?.[1]
  return { uid, historyCounter }
}

async function fetchTrackerLevelHistory(
  uid: string,
  historyCounter?: string,
): Promise<PulseStatsLevelHistoryEntry[] | undefined> {
  const params = new URLSearchParams({ UID: uid, page: '1' })
  if (historyCounter) params.set('historyCounter', historyCounter)
  const url = `${STATS_HISTORY_URL}?${params.toString()}`
  const html = await fetchTrackerHtml(url, `level-history:${uid}`)
  const rows = parseLevelHistoryRows(html)
  if (rows.length) return rows
  return undefined
}

function parseLevelHistoryRows(html: string): PulseStatsLevelHistoryEntry[] {
  if (!html) return []
  const $ = cheerio.load(html)
  const entries: PulseStatsLevelHistoryEntry[] = []
  $('table tr')
    .filter((_, row) => $(row).find('td').length >= 4)
    .each((_, row) => {
      const cells = $(row).find('td')
      const index = parseInteger(cells.eq(0).text()) ?? entries.length + 1
      const whenRaw = cells.eq(1).text().trim()
      const relative = cells.eq(2).text().trim() || undefined
      const levelCell = cells.eq(3)
      const level = parseInteger(levelCell.text()) ?? 0
      const htmlContent = levelCell.html() ?? ''
      let change: PulseStatsLevelHistoryEntry['change']
      if (htmlContent.includes('fa-caret-up')) change = 'up'
      else if (htmlContent.includes('fa-caret-down')) change = 'down'
      else change = 'same'
      entries.push({
        index,
        when: normalizeTrackerDateTime(whenRaw) ?? whenRaw,
        relative,
        level,
        change,
      })
    })
  return entries
}

async function fetchTrackerDeaths(uid: string): Promise<PulseStatsDeathEntry[] | undefined> {
  const params = new URLSearchParams({ UID: uid, page: '1' })
  const url = `${STATS_DEATH_URL}?${params.toString()}`
  const html = await fetchTrackerHtml(url, `death-history:${uid}`)
  const entries = parseTrackerDeaths(html)
  if (entries.length) return entries
  return undefined
}

function parseTrackerDeaths(html: string): PulseStatsDeathEntry[] {
  if (!html) return []
  const $ = cheerio.load(html)
  const entries: PulseStatsDeathEntry[] = []
  $('table tr')
    .filter((_, row) => $(row).find('td').length >= 4)
    .each((_, row) => {
      const cells = $(row).find('td')
      const index = parseInteger(cells.eq(0).text()) ?? entries.length + 1
      const when = cells.eq(1).text().trim()
      const killer = cells.eq(2).text().trim()
      const level = parseInteger(cells.eq(3).text()) ?? 0
      const expLost = cells.eq(4) ? parseSignedInteger(cells.eq(4).text()) : undefined
      entries.push({
        index,
        when: normalizeTrackerDateTime(when) ?? when,
        killer,
        level,
        expLost,
      })
    })
  return entries
}

function parseRankCell(cell: cheerio.Cheerio) {
  const clone = cell.clone()
  clone.find('div').remove()
  const value = parseInteger(clone.text())
  const deltaText = cell.find('div').text()
  const delta = parseSignedInteger(deltaText)
  return { value, delta }
}

function parseDurationToMinutes(value?: string) {
  if (!value) return undefined
  const hoursMatch = value.match(/(\d+)\s*h/i)
  const minutesMatch = value.match(/(\d+)\s*min/i)
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0
  const total = hours * 60 + minutes
  return total > 0 ? total : undefined
}

function parseInteger(value?: string | null) {
  if (!value) return undefined
  const cleaned = value.replace(/[^\d-]/g, '')
  if (!cleaned) return undefined
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseSignedInteger(value?: string | null) {
  if (!value) return undefined
  const cleaned = value.replace(/[^\d-]/g, '')
  if (!cleaned) return undefined
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeTrackerDate(value?: string) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const match = trimmed.match(/(\d{2})-(\d{2})-(\d{4})/)
  if (!match) return undefined
  return `${match[3]}-${match[2]}-${match[1]}`
}

function normalizeTrackerDateTime(value?: string) {
  if (!value) return undefined
  const match = value.trim().match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/)
  if (!match) return undefined
  const [, dd, mm, yyyy, hh, min] = match
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min)))
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

function absoluteTrackerUrl(href?: string) {
  if (!href) return undefined
  if (/^https?:\/\//i.test(href)) return href
  try {
    return new URL(href, 'https://guildstats.eu/').toString()
  } catch {
    return undefined
  }
}

export async function fetchPulseStats(name: string): Promise<PulseStatsSummary | null> {
  const experienceHtml = await fetchTrackerTab(name, 9)
  if (!experienceHtml || isTrackerNotFound(experienceHtml)) {
    return null
  }

  const [timeHtml, highscoreHtml, historyHtml] = await Promise.all([
    fetchTrackerTab(name, 2).catch(() => ''),
    fetchTrackerTab(name, 3).catch(() => ''),
    fetchTrackerTab(name, 8).catch(() => ''),
  ])

  const history = parseExperienceHistory(experienceHtml)
  const currentXP = history[0]?.experience
  const bestDay = parseBestDay(experienceHtml)
  const averageDaily = parseAverageDaily(experienceHtml)

  const timeOnline = parseTimeOnlineSummary(timeHtml)
  const highscores = parseHighscores(highscoreHtml)

  const { uid, historyCounter } = extractUidAndHistoryCounter(historyHtml)
  const [levelHistory, guildDeaths] = await Promise.all([
    uid ? fetchTrackerLevelHistory(uid, historyCounter) : Promise.resolve<PulseStatsLevelHistoryEntry[] | undefined>(undefined),
    uid ? fetchTrackerDeaths(uid) : Promise.resolve<PulseStatsDeathEntry[] | undefined>(undefined),
  ])

  return {
    currentXP,
    bestDay,
    averageDaily,
    history,
    levelHistory,
    timeOnline,
    highscores,
    guildDeaths,
  }
}
