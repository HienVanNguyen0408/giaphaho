import dotenv from 'dotenv';
import path from 'path';

// Load .env.dev in development, .env in production
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.dev';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
// Fallback to .env if the specific file doesn't define everything
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: false });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.route';
import memberRouter from './routes/member.route';
import newsRouter from './routes/news.route';
import videoRouter from './routes/video.route';
import sectionRouter from './routes/section.route';
import footerRouter from './routes/footer.route';
import notificationRouter from './routes/notification.route';
import activityLogRouter from './routes/activity-log.route';
import searchRouter from './routes/search.route';
import uploadRouter from './routes/upload.route';
import dashboardRouter from './routes/dashboard.route';
import analyticsRouter from './routes/analytics.route';
import { errorHandler } from './middlewares/error.middleware';
import { activityLogger } from './middlewares/logger.middleware';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const origins = FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isLocal =
        origin.startsWith('http://localhost:') ||
        origin === 'http://localhost' ||
        origin.startsWith('http://127.0.0.1:') ||
        origin === 'http://127.0.0.1';

      if (isLocal || origins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(activityLogger);

app.use('/api/auth', authRouter);
app.use('/api/members', memberRouter);
app.use('/api/news', newsRouter);
app.use('/api/videos', videoRouter);
app.use('/api/sections', sectionRouter);
app.use('/api/footer', footerRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/activity-logs', activityLogRouter);
app.use('/api/search', searchRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 8080);

if (process.env.NODE_ENV !== 'test') {
  import('./middlewares/license').then(({ validateLicense }) => {
    validateLicense().then(() => {
      app.listen(PORT, () => {
        console.warn(`Backend running on http://localhost:${PORT}`);
      });
    });
  }).catch(() => {
    app.listen(PORT, () => {
      console.warn(`Backend running on http://localhost:${PORT}`);
    });
  });
}

export default app;
