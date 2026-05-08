import { Router } from 'express';
import { NewsController } from '../controllers/news.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/pinned', NewsController.getPinned);
router.get('/', NewsController.getList);
router.post('/', authenticate, requireRole(Role.SUPER_ADMIN), NewsController.create);
router.patch('/reorder', authenticate, requireRole(Role.SUPER_ADMIN), NewsController.reorder);
router.patch('/:id/pin', authenticate, requireRole(Role.SUPER_ADMIN), NewsController.togglePin);
router.put('/:id', authenticate, requireRole(Role.SUPER_ADMIN), NewsController.update);
router.delete('/:id', authenticate, requireRole(Role.SUPER_ADMIN), NewsController.delete);
router.get('/slug/:slug', NewsController.getBySlug);
router.get('/:id', NewsController.getById);

export default router;
