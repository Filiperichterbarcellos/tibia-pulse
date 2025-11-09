import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { FavoriteController } from '../controllers/favorite.controller'

const router = Router()

router.get('/', requireAuth, FavoriteController.list)
router.post('/', requireAuth, FavoriteController.create)
router.delete('/:id', requireAuth, FavoriteController.remove)

export default router
