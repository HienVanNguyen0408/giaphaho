import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { MemberController } from '../controllers/member.controller';

const router = Router();

router.get('/', MemberController.getAll);
// Static sub-routes must come before /:id to avoid the wildcard catching them
router.post('/recalculate-stats', authenticate, requireRole(Role.SUPER_ADMIN), MemberController.recalculateStats);
router.get('/recalculate-stats/events', authenticate, requireRole(Role.SUPER_ADMIN), MemberController.recalculateStatsEvents);
router.get('/:id', MemberController.getById);
router.post('/', authenticate, requireRole(Role.SUPER_ADMIN, Role.CHI_ADMIN), MemberController.create);
router.put('/:id', authenticate, requireRole(Role.SUPER_ADMIN, Role.CHI_ADMIN), MemberController.update);
router.delete('/:id', authenticate, requireRole(Role.SUPER_ADMIN), MemberController.delete);

export default router;
