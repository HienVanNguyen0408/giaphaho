import { Router } from 'express'
import { listNotifications, markRead, markAllRead } from '../services/notification.service'
import { sendSuccess, sendError } from '../utils/response'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

router.use(authenticate)

router.get('/', async (_req, res) => {
  try {
    const notifications = await listNotifications()
    sendSuccess(res, { notifications })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to list notifications', 500)
  }
})

router.patch('/read-all', async (_req, res) => {
  try {
    await markAllRead()
    sendSuccess(res, { message: 'All notifications marked as read' })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to mark all as read', 500)
  }
})

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await markRead(req.params.id)
    sendSuccess(res, { notification })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to mark notification as read', 500)
  }
})

export default router
