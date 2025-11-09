import { Router } from 'express'
import { z } from 'zod'
import { getAuctions } from '../services/marketService'

const router = Router()

// Raiz: útil pro teste de "200"
router.get('/', (_req, res) => res.json({ ok: true }))

const filtersSchema = z.object({
  world: z.string().optional(),
  vocation: z.string().optional(),
  minLevel: z.coerce.number().int().positive().optional(),
  maxLevel: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  order: z.enum(['price', 'level', 'end']).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
})

/**
 * GET /api/market/auctions?world=&vocation=&minLevel=&maxLevel=&page=&order=&sort=
 */
router.get('/auctions', async (req, res) => {
  const parsed = filtersSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  try {
    const auctions = await getAuctions(parsed.data)
    return res.json({ auctions })
  } catch (err) {
    console.error('GET /api/market/auctions ->', err)
    return res.status(502).json({ error: 'upstream error' })
  }
})

export default router
