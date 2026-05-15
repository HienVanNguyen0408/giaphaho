import { Router } from 'express'
import { loginHandler, logoutHandler, meHandler } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

router.post('/login', loginHandler)
router.post('/logout', logoutHandler)
router.get('/me', authenticate, meHandler)

export default router
