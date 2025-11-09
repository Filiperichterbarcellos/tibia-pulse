import { Router } from 'express'

const router = Router()

// GET /api/calculator/tibia-coin?price=&tc=
router.get('/tibia-coin', (req, res) => {
  const price = Number(req.query.price)
  const tc = Number(req.query.tc)

  if (!Number.isFinite(price) || !Number.isFinite(tc) || tc <= 0) {
    return res.status(400).json({ error: 'invalid params' })
  }

  const coins = Math.ceil(price / tc)
  return res.json({ coins })
})

export default router
