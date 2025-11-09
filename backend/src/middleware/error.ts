import type { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // evita vazar stack em prod
  const body = process.env.NODE_ENV === 'development'
    ? { error: 'internal error', detail: String(err?.message || err) }
    : { error: 'internal error' }

  console.error('[unhandled]', err)
  res.status(500).json(body)
}
