// src/controllers/auth.controller.ts
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { signToken } from '../utils/jwt'
import { AuthRequest } from '../middleware/requireAuth'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const AuthController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid body', details: parsed.error.flatten() })
    }

    const { email, name, password } = parsed.data

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' })

    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, name, password: hash },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    const token = signToken({ id: user.id, email: user.email })
    return res.status(201).json({ user, token })
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid body', details: parsed.error.flatten() })
    }

    const { email, password } = parsed.data

    // ⚠️ sem select: precisamos do hash
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }

    const token = signToken({ id: user.id, email: user.email })
    return res.json({ user: safeUser, token })
  },

  async me(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' })

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    return res.json({ user })
  },
}
