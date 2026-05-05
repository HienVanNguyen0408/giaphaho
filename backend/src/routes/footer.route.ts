import { Router } from 'express';
import { FooterController } from '../controllers/footer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', FooterController.get);
router.put('/', authenticate, requireRole(Role.SUPER_ADMIN), FooterController.update);

export default router;
