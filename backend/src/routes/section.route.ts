import { Router } from 'express';
import { SectionController } from '../controllers/section.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', SectionController.getList);
router.patch('/reorder', authenticate, requireRole(Role.SUPER_ADMIN), SectionController.reorder);
router.post('/', authenticate, requireRole(Role.SUPER_ADMIN), SectionController.create);
router.put('/:id', authenticate, requireRole(Role.SUPER_ADMIN), SectionController.update);
router.patch('/:id/toggle', authenticate, requireRole(Role.SUPER_ADMIN), SectionController.toggle);
router.delete('/:id', authenticate, requireRole(Role.SUPER_ADMIN), SectionController.delete);

export default router;
