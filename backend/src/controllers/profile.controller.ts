import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/requireAuth'
import { resolveCharacterSummary } from '../routes/characters'

const updateSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80)
    .optional(),
  mainCharacter: z
    .union([z.string().trim().min(3).max(50), z.literal(''), z.null()])
    .optional(),
})

export const ProfileController = {
  async update(req: AuthRequest, res: Response) {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid body', details: parsed.error.flatten() })
    }

    const updates: Record<string, any> = {}
    if (Object.prototype.hasOwnProperty.call(parsed.data, 'name')) {
      const value = parsed.data.name?.trim() || null
      updates.name = value
    }

    if (Object.prototype.hasOwnProperty.call(parsed.data, 'mainCharacter')) {
      const value = parsed.data.mainCharacter
      updates.mainCharacter =
        typeof value === 'string' && value.trim().length ? value.trim() : null
    }

  const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        mainCharacter: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return res.json({ user })
  },

  async trackedCharacter(req: AuthRequest, res: Response) {
    const profile = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { mainCharacter: true },
    })
    const name = profile?.mainCharacter
    if (!name) {
      return res.status(400).json({ error: 'no-character-set' })
    }

    try {
      const summary = await resolveCharacterSummary(name)
      return res.json({ character: summary })
    } catch (err: any) {
      if ((err as any)?.code === 404 || (err as any)?.message === 'not-found') {
        return res.status(404).json({ error: 'character-not-found' })
      }
      console.error('[profile] character fetch failed', err)
      return res.status(502).json({ error: 'upstream-error' })
    }
  },
}
