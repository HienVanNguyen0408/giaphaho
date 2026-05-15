import cron from 'node-cron'
import { scanExpiringLicenses } from '../services/notification.service'

export function startCronJobs() {
  // Run every day at 08:00
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Scanning expiring licenses...')
    try {
      const result = await scanExpiringLicenses()
      console.log(`[CRON] Created ${result.created} notifications`)
    } catch (err) {
      console.error('[CRON] Failed to scan expiring licenses:', err)
    }
  })
}
