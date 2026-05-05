import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', VideoController.getAll);
router.post('/', authenticate, requireRole(Role.SUPER_ADMIN), VideoController.create);
router.patch('/reorder', authenticate, requireRole(Role.SUPER_ADMIN), VideoController.reorder);
router.put('/:id', authenticate, requireRole(Role.SUPER_ADMIN), VideoController.update);
router.delete('/:id', authenticate, requireRole(Role.SUPER_ADMIN), VideoController.delete);

export default router;
