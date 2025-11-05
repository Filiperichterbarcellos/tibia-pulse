import { Router } from 'express';

const router = Router();

router.get('/api/market', (_req, res) => {
  res.status(200).json({
    items: [
      { name: 'Dragon Scale Mail', avgPrice: 180000 },
      { name: 'Magic Plate Armor', avgPrice: 220000 }
    ]
  });
});

export default router;
