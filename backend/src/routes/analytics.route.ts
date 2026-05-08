import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', AnalyticsController.track);
router.get('/summary', authenticate, AnalyticsController.summary);

export default router;
