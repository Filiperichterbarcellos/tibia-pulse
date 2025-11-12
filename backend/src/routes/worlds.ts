import { Router } from 'express'
import { getWorlds, getWorldDetail } from '../services/worlds'
import { normalizeWorldType, normalizeBattleye, normalizeLocation, sortWorlds } from '../utils/worlds'

const router = Router()

// GET /api/worlds?type=&battleye=&location=&sort=&order=&limit=
router.get('/', async (req, res, next) => {
  try {
    const data = await getWorlds()
    if (!data) return res.status(404).json({ error: 'not found' })

    const list = (data.regular_worlds ?? data.worlds ?? []) as any[]
    const type = normalizeWorldType(req.query.type as string)
    const battleye = normalizeBattleye(req.query.battleye as string)
    const location = normalizeLocation(req.query.location as string)
    const sort = req.query.sort as string
    const order = req.query.order as string
    const limit = Number(req.query.limit || 0)

    let filtered = list.map(w => ({
      name: w.name,
      players_online: w.players_online,
      location: w.location,
      pvp_type: (w.pvp_type || w.pvpType || '').toLowerCase(),
      battleye_status: (w.battleye_status || w.battleye || '').toLowerCase(),
      online_record: w.online_record || { players: undefined, date: undefined },
    }))

    if (type) filtered = filtered.filter(w => w.pvp_type.includes(type))
    if (battleye) filtered = filtered.filter(w =>
      battleye === 'protected' ? w.battleye_status.includes('protected') : w.battleye_status.includes('unprotected')
    )
    if (location) filtered = filtered.filter(w => String(w.location).toUpperCase() === location)

    filtered = sortWorlds(filtered, sort, order)
    if (limit > 0) filtered = filtered.slice(0, limit)

    res.json({
      players_online_total: data.players_online ?? filtered.reduce((acc, w) => acc + (w.players_online ?? 0), 0),
      count: filtered.length,
      worlds: filtered,
    })
  } catch (e: any) {
    if (e?.status === 503) {
      return res.status(503).json({ error: 'upstream unavailable' })
    }
    next(e)
  }
})

// GET /api/worlds/:name
router.get('/:name', async (req, res, next) => {
  try {
    const world = await getWorldDetail(req.params.name)
    if (!world) return res.status(404).json({ error: 'not found' })
    res.json(world)
  } catch (e: any) {
    if (e?.status === 503) {
      return res.status(503).json({ error: 'upstream unavailable' })
    }
    next(e)
  }
})

export default router
