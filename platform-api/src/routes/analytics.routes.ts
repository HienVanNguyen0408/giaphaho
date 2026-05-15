import { Router } from 'express'
import { getOverview, getClansPerMonth, getLicenseBreakdown, getExpiryList } from '../services/analytics.service'
import { sendSuccess, sendError } from '../utils/response'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

router.use(authenticate)

router.get('/overview', async (_req, res) => {
  try {
    const data = await getOverview()
    sendSuccess(res, data)
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to get overview', 500)
  }
})

router.get('/clans', async (_req, res) => {
  try {
    const data = await getClansPerMonth()
    sendSuccess(res, data)
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to get clan analytics', 500)
  }
})

router.get('/licenses', async (_req, res) => {
  try {
    const data = await getLicenseBreakdown()
    sendSuccess(res, data)
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to get license breakdown', 500)
  }
})

router.get('/expiry', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30
    const data = await getExpiryList(days)
    sendSuccess(res, data)
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to get expiry list', 500)
  }
})

export default router
