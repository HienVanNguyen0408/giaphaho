import { Router } from 'express'
import { generateDownloadHandler, processDownloadHandler } from '../controllers/license.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

router.get('/:token', processDownloadHandler)

// Generate download token is nested under clans router
export const generateDownloadRoute = Router({ mergeParams: true })
generateDownloadRoute.use(authenticate)
generateDownloadRoute.post('/generate', generateDownloadHandler)

export default router
