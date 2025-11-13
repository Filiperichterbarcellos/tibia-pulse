import { Router, Request, Response } from 'express'
import { TibiaDataClient } from '../services/tibiadata'
import { fetchCharacterProfile, fetchPulseStats } from '../services/characterService'
import type { CharacterSummary, PulseStatsSummary } from '../types/character'
import { getCache, setCache } from '../utils/cache'

const router = Router()
const CHARACTER_CACHE_TTL =
  Number(process.env.CHARACTER_CACHE_TTL ?? 180_000) // 3 minutos de cache em produção

router.get('/:name', async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name || '').trim()
    if (!name) return res.status(400).type('application/json').json({ error: 'missing name' })

    const summary = await resolveCharacterSummary(name)
    return res.type('application/json').json(summary)
  } catch (e) {
    if ((e as any)?.code === 404 || (e as any)?.message === 'not-found') {
      return res.status(404).type('application/json').json({ error: 'not found' })
    }
    console.error('[characters] upstream error', e)
    return res.status(502).type('application/json').json({ error: 'upstream error' })
  }
})

function calculateXpToNextLevel(level: number, currentXP: number) {
  const nextLevel = level + 1
  const xpForNext = Math.floor(50 * (nextLevel ** 3 - 6 * nextLevel ** 2 + 17 * nextLevel - 12) / 3)
  return Math.max(0, xpForNext - currentXP)
}

function hasTrackerData(summary: CharacterSummary) {
  const tracker = summary.trackerStats
  if (trackerHasData(tracker)) return true
  if (typeof summary.averageDailyXP === 'number') return true
  if (summary.bestDayXP) return true
  return false
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function resolveCharacterSummary(name: string): Promise<CharacterSummary> {
  const cacheKey = `character:${name.toLowerCase()}`
  const cached = getCache<CharacterSummary>(cacheKey)
  if (cached) return cached

  const summary = await buildCharacterSummary(name)
  if (hasTrackerData(summary)) {
    setCache(cacheKey, summary, CHARACTER_CACHE_TTL)
  } else {
    setCache(cacheKey, summary, Math.min(CHARACTER_CACHE_TTL, 10_000))
  }
  return summary
}

async function buildCharacterSummary(name: string): Promise<CharacterSummary> {
  const [tibiaData, tibiaProfile, trackerStats] = await Promise.all([
    TibiaDataClient.character(name).catch((err) => {
      console.warn('[tibiadata] fallback triggered', err?.message ?? err)
      return null
    }),
    fetchCharacterProfile(name),
    fetchTrackerStatsWithRetry(name),
  ])

  const c = tibiaData
    ? (tibiaData as any).character ??
      (tibiaData as any).characters?.character ??
      (tibiaData as any).data?.character ??
      tibiaData
    : null

  const level = tibiaProfile.level || Number(c?.level) || 0

  return {
    name: tibiaProfile.name,
    level,
    vocation: tibiaProfile.vocation ?? c?.vocation ?? undefined,
    world: tibiaProfile.world ?? c?.world ?? undefined,
    residence: tibiaProfile.residence ?? c?.residence ?? c?.residence_city ?? undefined,
    guild: normalizeGuild(tibiaProfile.guild) ?? normalizeGuild(c?.guild) ?? undefined,
    sex: tibiaProfile.sex ?? c?.sex ?? undefined,
    created: normalizeDate(tibiaProfile.created) ?? normalizeDate(c?.created) ?? undefined,
    lastLogin: normalizeDate(tibiaProfile.lastLogin) ?? normalizeDate(c?.last_login) ?? undefined,
    accountStatus: tibiaProfile.accountStatus ?? c?.account_status ?? undefined,
    house: emptyToUndefined(tibiaProfile.house),
    comment: emptyToUndefined(tibiaProfile.comment),
    formerNames: emptyToUndefined(tibiaProfile.formerNames),
    title: emptyToUndefined(tibiaProfile.title),
    formerWorld: emptyToUndefined(tibiaProfile.formerWorld),
    achievementPoints:
      tibiaProfile.achievementPoints ??
      (typeof c?.achievement_points === 'number' ? c.achievement_points : undefined),
    deaths: tibiaProfile.deaths.length
      ? tibiaProfile.deaths
      : Array.isArray(c?.deaths)
        ? c.deaths.map((d: any) => ({
            time: d?.time ? new Date(d.time).toISOString() : null,
            level: Number(d?.level) || 0,
            reason: d?.reason ?? '',
          }))
        : [],
    currentXP: trackerStats?.currentXP,
    xpToNextLevel: trackerStats?.currentXP
      ? calculateXpToNextLevel(level, trackerStats.currentXP)
      : undefined,
    averageDailyXP: trackerStats?.averageDaily ?? undefined,
    bestDayXP: trackerStats?.bestDay ?? null,
    history: trackerStats?.history,
    trackerStats: trackerStats ?? undefined,
  }
}

async function fetchTrackerStatsWithRetry(name: string): Promise<PulseStatsSummary | null> {
  const attempts = Number(process.env.TRACKER_ATTEMPTS ?? 3)
  const baseDelay = Number(process.env.TRACKER_ATTEMPT_DELAY ?? 800)

  for (let i = 0; i < attempts; i += 1) {
    try {
      const stats = await fetchPulseStats(name)
      if (trackerHasData(stats)) {
        return stats
      }
    } catch (err) {
      console.warn('[tracker] stats fetch failed', { name, attempt: i + 1, reason: err })
    }
    await sleep(baseDelay * (i + 1))
  }
  return null
}

function trackerHasData(stats?: PulseStatsSummary | null) {
  if (!stats) return false
  if (stats.history?.length) return true
  if (stats.levelHistory?.length) return true
  if (stats.timeOnline) return true
  if (stats.highscores?.length) return true
  if (stats.guildDeaths?.length) return true
  if (typeof stats.averageDaily === 'number') return true
  if (stats.bestDay) return true
  if (typeof stats.currentXP === 'number') return true
  return false
}

function emptyToUndefined(value?: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

function normalizeGuild(value?: unknown) {
  if (!value) return undefined
  if (typeof value === 'string') return emptyToUndefined(value)
  if (typeof value === 'object' && value !== null) {
    const name = emptyToUndefined((value as any).name)
    const rank = emptyToUndefined((value as any).rank)
    if (name && rank) return `${name} (${rank})`
    if (name) return name
    if (rank) return rank
  }
  return undefined
}

function normalizeDate(value?: string | null) {
  if (!value) return undefined
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  return value
}

export default router
