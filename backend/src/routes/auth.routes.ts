import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { OAuthController } from '../controllers/oauth.controller'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.get('/me', requireAuth, AuthController.me)

router.get('/google', OAuthController.googleStart)
router.get('/google/callback', OAuthController.googleCallback)

export default router
