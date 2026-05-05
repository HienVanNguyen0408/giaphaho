import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { sendSuccess, sendError } from '../utils/response';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

export const UploadController = {
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      sendError(res, 'No file provided', 400);
      return;
    }

    const result = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'giaphaho', resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Upload failed'));
          } else {
            resolve({ url: result.secure_url, publicId: result.public_id });
          }
        },
      );
      stream.end(req.file!.buffer);
    });

    sendSuccess(res, result);
  },
};
