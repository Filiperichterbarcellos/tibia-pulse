// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: { id: string; email: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente' })
  }

  const token = auth.slice('Bearer '.length).trim()

  try {
    const payload = verifyToken<{ id: string; email: string }>(token)
    req.user = { id: payload.id, email: payload.email }
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
