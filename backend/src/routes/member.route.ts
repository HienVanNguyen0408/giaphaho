import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { MemberController } from '../controllers/member.controller';

const router = Router();

router.get('/', MemberController.getAll);
router.post('/recalculate-stats', authenticate, requireRole(Role.SUPER_ADMIN), MemberController.recalculateStats);
router.get('/:id', MemberController.getById);
router.post('/', authenticate, requireRole(Role.SUPER_ADMIN, Role.CHI_ADMIN), MemberController.create);
router.put('/:id', authenticate, requireRole(Role.SUPER_ADMIN, Role.CHI_ADMIN), MemberController.update);
router.delete('/:id', authenticate, requireRole(Role.SUPER_ADMIN), MemberController.delete);

export default router;
