import { Request, Response } from 'express'
import { generateKey, revokeKey, renewKey, getLicenseHistory, generateDownloadToken, processDownload } from '../services/license.service'
import { sendSuccess, sendError } from '../utils/response'
import { generateLicenseSchema, renewLicenseSchema, validateKeySchema } from '../validators/license.validator'
import { validateKey } from '../services/license.service'

export async function generateHandler(req: Request, res: Response): Promise<void> {
  const parsed = generateLicenseSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid input', 400, parsed.error.errors)
    return
  }

  try {
    const license = await generateKey(req.params.clanId, parsed.data.expiresAt)
    sendSuccess(res, { license }, 201)
  } catch (err) {
    if (err instanceof Error && err.message === 'CLAN_NOT_FOUND') {
      sendError(res, 'CLAN_NOT_FOUND', 'Clan not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to generate license', 500)
    }
  }
}

export async function revokeHandler(req: Request, res: Response): Promise<void> {
  try {
    await revokeKey(req.params.clanId, req.params.lid)
    sendSuccess(res, { message: 'License revoked' })
  } catch (err) {
    if (err instanceof Error && err.message === 'LICENSE_NOT_FOUND') {
      sendError(res, 'LICENSE_NOT_FOUND', 'License not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to revoke license', 500)
    }
  }
}

export async function renewHandler(req: Request, res: Response): Promise<void> {
  const parsed = renewLicenseSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid input', 400, parsed.error.errors)
    return
  }

  try {
    const license = await renewKey(req.params.clanId, req.params.lid, parsed.data.months)
    sendSuccess(res, { license })
  } catch (err) {
    if (err instanceof Error && err.message === 'LICENSE_NOT_FOUND') {
      sendError(res, 'LICENSE_NOT_FOUND', 'License not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to renew license', 500)
    }
  }
}

export async function historyHandler(req: Request, res: Response): Promise<void> {
  try {
    const licenses = await getLicenseHistory(req.params.clanId)
    sendSuccess(res, { licenses })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to get license history', 500)
  }
}

export async function validateHandler(req: Request, res: Response): Promise<void> {
  const parsed = validateKeySchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid key format', 400, parsed.error.errors)
    return
  }

  try {
    const result = await validateKey(parsed.data.key)
    sendSuccess(res, result)
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to validate license', 500)
  }
}

export async function generateDownloadHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await generateDownloadToken(req.params.id)
    sendSuccess(res, result, 201)
  } catch (err) {
    if (err instanceof Error) {
      const errorMap: Record<string, [string, number]> = {
        CLAN_NOT_FOUND: ['CLAN_NOT_FOUND', 404],
        NO_ACTIVE_LICENSE: ['NO_ACTIVE_LICENSE', 400],
        DOWNLOAD_LIMIT_EXCEEDED: ['DOWNLOAD_LIMIT_EXCEEDED', 403],
      }
      const [code, status] = errorMap[err.message] ?? ['INTERNAL_ERROR', 500]
      sendError(res, code, err.message, status)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to generate download token', 500)
    }
  }
}

export async function processDownloadHandler(req: Request, res: Response): Promise<void> {
  try {
    const ip = req.ip
    const userAgent = req.headers['user-agent']
    await processDownload(req.params.token, ip, userAgent)
    res.redirect('https://storage.giaphaho.vn/downloads/giaphaho-latest.zip')
  } catch (err) {
    if (err instanceof Error) {
      const errorMap: Record<string, [string, number]> = {
        INVALID_TOKEN: ['INVALID_TOKEN', 400],
        TOKEN_NOT_FOUND: ['TOKEN_NOT_FOUND', 404],
        TOKEN_ALREADY_USED: ['TOKEN_ALREADY_USED', 410],
        TOKEN_EXPIRED: ['TOKEN_EXPIRED', 410],
      }
      const [code, status] = errorMap[err.message] ?? ['INTERNAL_ERROR', 500]
      sendError(res, code, err.message, status)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to process download', 500)
    }
  }
}
