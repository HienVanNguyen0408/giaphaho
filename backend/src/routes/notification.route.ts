import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, NotificationController.getAll);
router.patch('/:id/read', authenticate, NotificationController.markRead);

export default router;
