import { Router } from 'express';

const router = Router();

router.get('/api/bosses', (_req, res) => {
  res.status(200).json({
    bosses: [
      { name: 'Orshabaal', location: 'Edron', respawn: 'rare' },
      { name: 'Morgaroth', location: 'Darashia', respawn: 'very rare' }
    ]
  });
});

export default router;
