import fetch from 'node-fetch'
import { readCache, writeCache, isWithinGracePeriod, getDaysOffline } from '../lib/licenseCache'

const VALIDATE_TIMEOUT_MS = 5000
const WARN_DAYS = 7

interface ValidateResponse {
  success: boolean
  data?: {
    valid: boolean
    type?: string
    expiresAt?: string
    clanCode?: string
    daysLeft?: number | null
    reason?: string
  }
}

async function callValidateEndpoint(key: string): Promise<ValidateResponse['data'] | null> {
  const platformUrl = process.env.PLATFORM_API_URL
  if (!platformUrl) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VALIDATE_TIMEOUT_MS)

  try {
    const res = await fetch(`${platformUrl}/api/license/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const json = (await res.json()) as ValidateResponse
    return json.data ?? null
  } catch {
    clearTimeout(timeout)
    return null
  }
}

export async function validateLicense(): Promise<void> {
  const licenseKey = process.env.LICENSE_KEY

  if (!licenseKey) {
    console.warn('[LICENSE] No LICENSE_KEY configured — skipping validation')
    return
  }

  const result = await callValidateEndpoint(licenseKey)

  if (result !== null) {
    if (!result.valid) {
      console.error(`[LICENSE] License invalid: ${result.reason}`)
      process.exit(1)
    }

    writeCache({
      key: licenseKey,
      valid: true,
      type: result.type,
      expiresAt: result.expiresAt,
      clanCode: result.clanCode,
    })

    if (result.daysLeft !== null && result.daysLeft !== undefined && result.daysLeft <= WARN_DAYS) {
      console.warn(`[LICENSE] ⚠️ License expires in ${result.daysLeft} days!`)
    }

    if (result.type === 'SUBSCRIPTION') {
      scheduleSubscriptionValidation(licenseKey)
    }

    return
  }

  // Platform API unreachable — fall back to cache
  const cache = readCache()

  if (!cache || cache.key !== licenseKey) {
    console.error('[LICENSE] Platform API unreachable and no cache available — exiting')
    process.exit(1)
  }

  if (!isWithinGracePeriod(cache)) {
    const days = getDaysOffline(cache)
    console.error(`[LICENSE] Grace period expired (${days} days offline) — exiting`)
    process.exit(1)
  }

  const days = getDaysOffline(cache)
  console.warn(`[LICENSE] Platform API unreachable — using cached license (${days} days old, ${WARN_DAYS - days} days grace remaining)`)
}

function scheduleSubscriptionValidation(key: string): void {
  const INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

  setInterval(async () => {
    const result = await callValidateEndpoint(key)

    if (result === null) {
      const cache = readCache()
      if (!cache || !isWithinGracePeriod(cache)) {
        console.error('[LICENSE] Subscription license could not be validated and grace period expired — server will reject requests')
      }
      return
    }

    if (!result.valid) {
      console.error(`[LICENSE] Subscription license expired/revoked: ${result.reason}`)
      return
    }

    writeCache({ key, valid: true, type: result.type, expiresAt: result.expiresAt, clanCode: result.clanCode })

    if (result.daysLeft !== null && result.daysLeft !== undefined && result.daysLeft <= WARN_DAYS) {
      console.warn(`[LICENSE] ⚠️ Subscription expires in ${result.daysLeft} days!`)
    }
  }, INTERVAL_MS)
}
