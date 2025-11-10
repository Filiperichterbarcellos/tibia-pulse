import { Router, Request, Response } from 'express'
import { TibiaDataClient } from '../services/tibiadata'
import { fetchCharacterProfile, fetchGuildStats } from '../services/characterService'
import type { CharacterSummary } from '../types/character'

const router = Router()

router.get('/:name', async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name || '').trim()
    if (!name) return res.status(400).type('application/json').json({ error: 'missing name' })

    const [tibiaData, tibiaProfile, guildStats] = await Promise.all([
      TibiaDataClient.character(name),
      fetchCharacterProfile(name),
      fetchGuildStats(name).catch(() => null),
    ])

    if (!tibiaData) {
      return res.status(404).type('application/json').json({ error: 'not found' })
    }

    // tenta achar a raiz independente do formato
    const c =
      (tibiaData as any).character ??
      (tibiaData as any).characters?.character ??
      (tibiaData as any).data?.character ??
      tibiaData

    const level = tibiaProfile.level || Number(c?.level) || 0

    const base: CharacterSummary = {
      name: tibiaProfile.name,
      level,
      vocation: tibiaProfile.vocation ?? c?.vocation ?? undefined,
      world: tibiaProfile.world ?? c?.world ?? undefined,
      residence: tibiaProfile.residence ?? c?.residence ?? c?.residence_city ?? undefined,
      guild: emptyToUndefined(tibiaProfile.guild) ?? c?.guild ?? undefined,
      sex: tibiaProfile.sex ?? c?.sex ?? undefined,
      created: normalizeDate(tibiaProfile.created) ?? normalizeDate(c?.created) ?? undefined,
      lastLogin:
        normalizeDate(tibiaProfile.lastLogin) ?? normalizeDate(c?.last_login) ?? undefined,
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
      currentXP: guildStats?.currentXP,
      xpToNextLevel: guildStats?.currentXP
        ? calculateXpToNextLevel(level, guildStats.currentXP)
        : undefined,
      averageDailyXP: guildStats?.averageDaily ?? undefined,
      bestDayXP: guildStats?.bestDay ?? null,
      history: guildStats?.history,
    }

    return res.type('application/json').json(base)
  } catch (e) {
    console.error('[characters] upstream error', e)
    return res.status(502).type('application/json').json({ error: 'upstream error' })
  }
})

function calculateXpToNextLevel(level: number, currentXP: number) {
  const nextLevel = level + 1
  const xpForNext = Math.floor(50 * (nextLevel ** 3 - 6 * nextLevel ** 2 + 17 * nextLevel - 12) / 3)
  return Math.max(0, xpForNext - currentXP)
}

function emptyToUndefined(value?: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

function normalizeDate(value?: string | null) {
  if (!value) return undefined
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  return value
}

export default router
