import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { multerUpload, UploadController } from '../controllers/upload.controller';

const router = Router();

router.post('/', authenticate, multerUpload.single('file'), UploadController.upload);

export default router;
