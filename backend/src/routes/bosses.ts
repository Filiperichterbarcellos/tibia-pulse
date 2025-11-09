import { Router } from 'express'
import { getBoostableBosses, getKillStatistics } from '../services/bosses'

const bosses = Router()

bosses.get('/boostable', async (_req, res, next) => {
  try {
    const data = await getBoostableBosses()
    if (!data) return res.status(404).json({ error: 'not found' })
    res.json(data)
  } catch (e) { next(e) }
})

bosses.get('/killstats/:world', async (req, res, next) => {
  try {
    const world = String(req.params.world || '').trim()
    if (!world) return res.status(400).json({ error: 'missing world' })
    const data = await getKillStatistics(world)
    if (!data) return res.status(404).json({ error: 'not found' })
    res.json(data)
  } catch (e) { next(e) }
})

export default bosses
