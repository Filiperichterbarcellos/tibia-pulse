import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { ProfileController } from '../controllers/profile.controller'

const router = Router()

router.put('/', requireAuth, ProfileController.update)
router.get('/character', requireAuth, ProfileController.trackedCharacter)

export default router
