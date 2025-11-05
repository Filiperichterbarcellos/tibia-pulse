import { Router } from 'express';

const router = Router();

/**
 * GET /api/calculator/tibia-coin
 * Query params:
 *  - price: preço do item em gold (ex: 600000)
 *  - tc: preço de 1 Tibia Coin em gold (ex: 25000)
 * Retorna: { coins: number }
 */
router.get('/api/calculator/tibia-coin', (req, res) => {
  const price = Number(req.query.price);
  const tc = Number(req.query.tc);

  if (!Number.isFinite(price) || !Number.isFinite(tc) || tc <= 0) {
    return res.status(400).json({ error: 'invalid params' });
  }

  const coins = Math.ceil(price / tc);
  return res.status(200).json({ coins });
});

export default router;
