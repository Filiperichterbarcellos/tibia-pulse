import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { getAuctions } from '../services/marketService'
import { mapAuction } from '../lib/mapAuction'

const router = Router()

// Sanidade
router.get('/', (_req: Request, res: Response) => res.json({ ok: true }))

const filtersSchema = z.object({
  world: z.string().optional(),
  vocation: z.string().optional(),
  minLevel: z.coerce.number().int().nonnegative().optional(),
  maxLevel: z.coerce.number().int().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  order: z.enum(['price', 'level', 'end']).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
})

// 🔒 Define um tipo **local** pro retorno do service para evitar colisão com
// qualquer tipo `Auction`/`AuctionIn` que exista no projeto.
type GetAuctionsResult = {
  auctions: any[]
  totalPages?: number
}

/**
 * GET /api/market/auctions?world=&vocation=&minLevel=&maxLevel=&page=&order=&sort=
 */
router.get('/auctions', async (req: Request, res: Response) => {
  const parsed = filtersSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  try {
    // 👇 força o shape esperado e evita o erro "Property 'auctions' does not exist..."
    const result = (await getAuctions(parsed.data)) as Partial<GetAuctionsResult>

    const sourceList = Array.isArray(result?.auctions) ? result!.auctions! : []
    const auctions = sourceList.map((a: any) => mapAuction(a))

    const page = Number(parsed.data.page || 1)
    const totalPages = Number(result?.totalPages ?? 1)

    return res.json({ page, totalPages, auctions })
  } catch (err) {
    console.error('GET /api/market/auctions ->', err)
    return res.status(502).json({ error: 'upstream error' })
  }
})

export default router
