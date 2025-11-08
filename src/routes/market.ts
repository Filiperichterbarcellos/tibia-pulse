import { Router } from 'express';
import * as svc from '../services/marketService';

const router = Router();

/**
 * GET /api/market/auctions?world=&vocation=&minLevel=&maxLevel=
 */
router.get('/api/market/auctions', async (req, res) => {
  try {
    const auctions = await svc.getAuctions({
      world: req.query.world as string | undefined,
      vocation: req.query.vocation as string | undefined,
      minLevel: req.query.minLevel ? Number(req.query.minLevel) : undefined,
      maxLevel: req.query.maxLevel ? Number(req.query.maxLevel) : undefined,
    });
    res.json({ auctions });
  } catch (err) {
    console.error('GET /api/market/auctions ->', err);
    res.status(502).json({ error: 'upstream error' });
  }
});

export default router;
