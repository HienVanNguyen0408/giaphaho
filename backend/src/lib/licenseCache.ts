import * as fs from 'fs'
import * as path from 'path'

const CACHE_FILE = path.join(process.cwd(), 'license.cache.json')
const GRACE_PERIOD_DAYS = 7

interface LicenseCache {
  key: string
  valid: boolean
  type?: string
  expiresAt?: string
  clanCode?: string
  lastValidated: string
}

export function readCache(): LicenseCache | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
    return JSON.parse(raw) as LicenseCache
  } catch {
    return null
  }
}

export function writeCache(data: Omit<LicenseCache, 'lastValidated'>): void {
  const cache: LicenseCache = { ...data, lastValidated: new Date().toISOString() }
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  } catch {
    console.error('[LICENSE] Failed to write license cache')
  }
}

export function isWithinGracePeriod(cache: LicenseCache): boolean {
  const lastValidated = new Date(cache.lastValidated)
  const graceCutoff = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
  return lastValidated > graceCutoff
}

export function getDaysOffline(cache: LicenseCache): number {
  const lastValidated = new Date(cache.lastValidated)
  return Math.ceil((Date.now() - lastValidated.getTime()) / (1000 * 60 * 60 * 24))
}
