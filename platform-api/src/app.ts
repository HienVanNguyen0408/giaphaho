import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { activityLogger } from './middlewares/activityLogger'
import authRouter from './routes/auth.routes'
import clanRouter from './routes/clan.routes'
import licensePublicRouter, { licenseAuthRouter } from './routes/license.routes'
import downloadRouter, { generateDownloadRoute } from './routes/download.routes'
import themeRouter from './routes/theme.routes'
import notificationRouter from './routes/notification.routes'
import analyticsRouter from './routes/analytics.routes'
import { startCronJobs } from './lib/cron'

const app = express()

const allowedOrigins = (process.env.FRONTEND_SUPER_ADMIN_URL ?? 'http://localhost:3001')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https?:\/\/([a-z0-9-]+\.)?giaphaho\.vn$/.test(origin)
      callback(null, isAllowed)
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(activityLogger)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)

// Clan routes (with nested license + theme + download)
app.use('/api/clans', clanRouter)
app.use('/api/clans/:clanId/license', licenseAuthRouter)
app.use('/api/clans/:id/theme', themeRouter)
app.use('/api/clans/:id/download', generateDownloadRoute)

// Public routes
app.use('/api/license', licensePublicRouter)
app.use('/api/download', downloadRouter)
app.use('/api/theme', themeRouter)

// Admin routes
app.use('/api/notifications', notificationRouter)
app.use('/api/analytics', analyticsRouter)

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    })
  }
)

const PORT = parseInt(process.env.PORT ?? '8090', 10)

app.listen(PORT, () => {
  console.log(`Platform API running on port ${PORT}`)
  startCronJobs()
})

export default app
