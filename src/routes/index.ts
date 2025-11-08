import { Router } from 'express'
import characters from './characters'
import bosses from './bosses'
import worlds from './worlds'   

const router = Router()

router.get('/_test', (_req, res) => res.json({ route: 'ok' }))
router.use('/characters', characters)
router.use('/bosses', bosses)
router.use('/worlds', worlds)  

export default router
