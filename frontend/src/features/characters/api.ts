import { apiClient } from '@/lib/apiClient'

export type DeathEntry = {
  time?: string
  level?: number
  reason?: string
}

export type CharacterExperienceEntry = {
  date: string
  expChange: number
  level: number
  vocationRank?: number
  vocationRankDelta?: number
  experience?: number
  timeOnlineText?: string
  timeOnlineMinutes?: number
  averageExpPerHour?: number
}

export type PulseStatsLevelHistoryEntry = {
  index: number
  when: string
  relative?: string
  level: number
  change?: 'up' | 'down' | 'same'
}

export type PulseStatsTimeOnlineDay = {
  label: string
  raw?: string
  durationMinutes?: number
  doubleEvent?: boolean
}

export type PulseStatsTimeOnlineSummary = {
  lastMonth?: string
  currentMonth?: string
  currentWeek?: string
  weekdays?: PulseStatsTimeOnlineDay[]
}

export type PulseStatsHighscoreEntry = {
  skill: string
  value: string
  position?: number
  link?: string
}

export type PulseStatsDeathEntry = {
  index: number
  when: string
  killer: string
  level: number
  expLost?: number
}

export type PulseStatsSummary = {
  currentXP?: number
  bestDay?: { date: string; value: number }
  averageDaily?: number
  history?: CharacterExperienceEntry[]
  levelHistory?: PulseStatsLevelHistoryEntry[]
  timeOnline?: PulseStatsTimeOnlineSummary
  highscores?: PulseStatsHighscoreEntry[]
  guildDeaths?: PulseStatsDeathEntry[]
}

export type CharacterSummary = {
  name: string
  level: number
  vocation?: string
  world?: string
  residence?: string
  sex?: string
  created?: string | null
  guild?: string
  lastLogin?: string | null
  accountStatus?: string
  house?: string
  comment?: string
  formerNames?: string
  title?: string
  loyaltyTitle?: string
  formerWorld?: string
  achievementPoints?: number
  currentXP?: number
  xpToNextLevel?: number
  averageDailyXP?: number
  bestDayXP?: { date: string; value: number } | null
  history?: CharacterExperienceEntry[]
  trackerStats?: PulseStatsSummary
  deaths: DeathEntry[]
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function requestWithRetry<T>(url: string, attempt = 0): Promise<T> {
  try {
    const { data } = await apiClient.get<T>(url)
    return data
  } catch (err: any) {
    const status = err?.response?.status
    const shouldRetry =
      attempt < 2 && (status === 404 || status === 502 || status === 503 || status === 504)
    if (shouldRetry) {
      await sleep(600 * (attempt + 1))
      return requestWithRetry<T>(url, attempt + 1)
    }
    throw err
  }
}

type CharacterApiResponse =
  | { character: CharacterSummary }
  | { characters?: { data: CharacterSummary } }
  | CharacterSummary

function extractCharacterPayload(payload: CharacterApiResponse): CharacterSummary {
  if (payload && typeof payload === 'object') {
    if ('character' in payload && payload.character) {
      return payload.character
    }
    if ('characters' in payload) {
      const characters = payload.characters as { data?: CharacterSummary }
      if (characters?.data) return characters.data
    }
  }
  return payload as CharacterSummary
}

export async function getCharacter(name: string): Promise<{ character: CharacterSummary }> {
  const data = await requestWithRetry<CharacterApiResponse>(
    `/api/characters/${encodeURIComponent(name)}`,
  )

  // Backend pode retornar em formatos levemente diferentes; normalizamos aqui
  const c = extractCharacterPayload(data)

  const deaths: DeathEntry[] =
    Array.isArray(c?.deaths) ? c.deaths
    : Array.isArray(c?.deaths?.data) ? c.deaths.data
    : []

  const historySource =
    Array.isArray(c?.history) ? c.history
    : Array.isArray(c?.history?.data) ? c.history.data
    : Array.isArray(c?.trackerStats?.history) ? c.trackerStats.history
    : null

  const history: CharacterExperienceEntry[] = historySource ?? []

  const character: CharacterSummary = {
    name: c?.name,
    level: c?.level,
    vocation: c?.vocation,
    world: c?.world,
    residence: c?.residence,
    sex: c?.sex,
    created: c?.created ?? null,
    guild: c?.guild,
    lastLogin: c?.last_login ?? c?.lastLogin ?? null,
    accountStatus: c?.accountStatus ?? c?.account_status,
    house: c?.house,
    comment: c?.comment,
    formerNames: c?.formerNames,
    title: c?.title,
    loyaltyTitle: c?.loyaltyTitle,
    formerWorld: c?.formerWorld,
    achievementPoints: c?.achievementPoints ?? c?.achievement_points,
    currentXP: asNumber(c?.currentXP ?? c?.experience),
    xpToNextLevel: asNumber(c?.xpToNextLevel ?? c?.xp_to_next_level),
    averageDailyXP: asNumber(c?.averageDailyXP ?? c?.avg_daily_xp),
    bestDayXP: c?.bestDayXP ?? c?.best_day ?? null,
    history,
    trackerStats: c?.trackerStats,
    deaths,
  }

  return { character }
}

function asNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d-]/g, ''))
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}
