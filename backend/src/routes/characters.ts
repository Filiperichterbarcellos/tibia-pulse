import { Router, Request, Response } from 'express'
import { TibiaDataClient } from '../services/tibiadata'

const router = Router()

router.get('/:name', async (req: Request, res: Response) => {
  try {
    const name = String(req.params.name || '').trim()
    if (!name) return res.status(400).type('application/json').json({ error: 'missing name' })

    const data = await TibiaDataClient.character(name)

    if (!data) {
      return res.status(404).type('application/json').json({ error: 'not found' })
    }

    // tenta achar a raiz independente do formato
    const c =
      (data as any).character ??
      (data as any).characters?.character ??
      (data as any).data?.character ??
      data

    const mapped = {
      name: c?.name ?? name,
      level: Number(c?.level) || 0,
      vocation: c?.vocation ?? null,
      world: c?.world ?? null,
      residence: c?.residence ?? c?.residence_city ?? null,
      achievementPoints: typeof c?.achievement_points === 'number' ? c.achievement_points : null,
      lastLogin: c?.last_login ? new Date(c.last_login).toISOString() : null,
      accountStatus: c?.account_status ?? null,
      deaths: Array.isArray(c?.deaths)
        ? c.deaths.map((d: any) => ({
            time: d?.time ? new Date(d.time).toISOString() : null,
            level: Number(d?.level) || 0,
            reason: d?.reason ?? '',
          }))
        : [],
      spriteUrl: c?.image_url ?? c?.portrait ?? null,
    }

    return res.type('application/json').json(mapped)
  } catch (e) {
    console.error('[characters] upstream error', e)
    return res.status(502).type('application/json').json({ error: 'upstream error' })
  }
})

export default router
