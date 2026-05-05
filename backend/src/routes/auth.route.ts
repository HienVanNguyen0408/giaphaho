import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/login', AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
