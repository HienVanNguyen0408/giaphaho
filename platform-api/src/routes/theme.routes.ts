import { Router } from 'express'
import { getHandler, updateHandler, uploadLogoHandler, uploadFaviconHandler, deleteLogoHandler, deleteFaviconHandler } from '../controllers/theme.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router({ mergeParams: true })

router.use(authenticate)
router.get('/', getHandler)
router.put('/', updateHandler)
router.post('/logo', uploadLogoHandler)
router.post('/favicon', uploadFaviconHandler)
router.delete('/logo', deleteLogoHandler)
router.delete('/favicon', deleteFaviconHandler)

export default router
