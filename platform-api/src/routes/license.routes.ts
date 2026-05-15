import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { generateHandler, revokeHandler, renewHandler, historyHandler, validateHandler } from '../controllers/license.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router({ mergeParams: true })

// Rate limit for public validate endpoint
const validateRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
})

// Public endpoint
router.post('/validate', validateRateLimit, validateHandler)

// Auth-required endpoints (nested under /api/clans/:clanId/license)
const authRouter = Router({ mergeParams: true })
authRouter.use(authenticate)
authRouter.post('/generate', generateHandler)
authRouter.patch('/:lid/revoke', revokeHandler)
authRouter.post('/:lid/renew', renewHandler)
authRouter.get('/history', historyHandler)

export default router
export { authRouter as licenseAuthRouter }
