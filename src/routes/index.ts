import { Router } from 'express';
import health from './health';
import bosses from './bosses';
import market from './market';
import calculator from './calculator';

export const router = Router();

router.use(health);
router.use(bosses);
router.use(market);
router.use(calculator);

export default router;
