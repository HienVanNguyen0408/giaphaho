import { Router } from 'express'
import { listHandler, createHandler, getOneHandler, updateHandler, updateStatusHandler, deleteHandler } from '../controllers/clan.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

router.use(authenticate)

router.get('/', listHandler)
router.post('/', createHandler)
router.get('/:id', getOneHandler)
router.patch('/:id', updateHandler)
router.patch('/:id/status', updateStatusHandler)
router.delete('/:id', deleteHandler)

export default router
