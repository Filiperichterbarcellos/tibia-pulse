import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/requireAuth'

const createSchema = z.object({
  type: z.enum(['AUCTION', 'BOSS']),
  key: z.string().min(1),
  notes: z.string().optional(),
})

export const FavoriteController = {
  async list(req: AuthRequest, res: Response) {
    const { type } = req.query as { type?: 'AUCTION' | 'BOSS' }
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ favorites })
  },

  async create(req: AuthRequest, res: Response) {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid body', details: parsed.error.flatten() })
    }
    const { type, key, notes } = parsed.data

    try {
      const favorite = await prisma.favorite.create({
        data: { userId: req.user!.id, type, key, notes },
      })
      return res.status(201).json({ favorite })
    } catch (err: any) {
      // viola @@unique([userId, type, key])
      return res.status(409).json({ error: 'favorite already exists for this user/type/key' })
    }
  },

  async remove(req: AuthRequest, res: Response) {
    const { id } = req.params
    const fav = await prisma.favorite.findUnique({ where: { id } })
    if (!fav || fav.userId !== req.user!.id) {
      return res.status(404).json({ error: 'not found' })
    }
    await prisma.favorite.delete({ where: { id } })
    return res.status(204).end()
  },
}
