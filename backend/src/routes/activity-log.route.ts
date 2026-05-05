import { Router } from 'express';
import { ActivityLogController } from '../controllers/activity-log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, requireRole(Role.SUPER_ADMIN), ActivityLogController.getAll);

export default router;
