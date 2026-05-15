import { Request, Response } from 'express'
import { getTheme, updateTheme, getPublicTheme, deleteLogo, deleteFavicon } from '../services/theme.service'
import { uploadImage, deleteImage } from '../lib/cloudinary'
import { sendSuccess, sendError } from '../utils/response'

export async function getHandler(req: Request, res: Response): Promise<void> {
  try {
    const theme = await getTheme(req.params.id)
    sendSuccess(res, { theme })
  } catch (err) {
    if (err instanceof Error && err.message === 'THEME_NOT_FOUND') {
      sendError(res, 'THEME_NOT_FOUND', 'Theme not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to get theme', 500)
    }
  }
}

export async function updateHandler(req: Request, res: Response): Promise<void> {
  try {
    const theme = await updateTheme(req.params.id, req.body)
    sendSuccess(res, { theme })
  } catch (err) {
    if (err instanceof Error) {
      const map: Record<string, [string, number]> = {
        CLAN_NOT_FOUND: ['CLAN_NOT_FOUND', 404],
        THEME_ONLY_FOR_SUBSCRIPTION: ['THEME_ONLY_FOR_SUBSCRIPTION', 403],
      }
      const [code, status] = map[err.message] ?? ['INTERNAL_ERROR', 500]
      sendError(res, code, err.message, status)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to update theme', 500)
    }
  }
}

export async function uploadLogoHandler(req: Request, res: Response): Promise<void> {
  if (!req.body?.fileBase64) {
    sendError(res, 'MISSING_FILE', 'File data required', 400)
    return
  }

  try {
    const buffer = Buffer.from(req.body.fileBase64, 'base64')
    const { url } = await uploadImage(buffer, `clans/${req.params.id}`, 'logo')
    const theme = await updateTheme(req.params.id, { logo: url })
    sendSuccess(res, { theme, url })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to upload logo', 500)
  }
}

export async function uploadFaviconHandler(req: Request, res: Response): Promise<void> {
  if (!req.body?.fileBase64) {
    sendError(res, 'MISSING_FILE', 'File data required', 400)
    return
  }

  try {
    const buffer = Buffer.from(req.body.fileBase64, 'base64')
    const { url } = await uploadImage(buffer, `clans/${req.params.id}`, 'favicon')
    const theme = await updateTheme(req.params.id, { favicon: url })
    sendSuccess(res, { theme, url })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to upload favicon', 500)
  }
}

export async function deleteLogoHandler(req: Request, res: Response): Promise<void> {
  try {
    await deleteImage(`platform/clans/${req.params.id}/logo`)
    const theme = await deleteLogo(req.params.id)
    sendSuccess(res, { theme })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to delete logo', 500)
  }
}

export async function deleteFaviconHandler(req: Request, res: Response): Promise<void> {
  try {
    await deleteImage(`platform/clans/${req.params.id}/favicon`)
    const theme = await deleteFavicon(req.params.id)
    sendSuccess(res, { theme })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to delete favicon', 500)
  }
}

export async function getPublicHandler(req: Request, res: Response): Promise<void> {
  try {
    const theme = await getPublicTheme(req.params.clanCode)
    if (!theme) {
      sendError(res, 'CLAN_NOT_FOUND', 'Clan not found or not active', 404)
      return
    }
    res.set('Cache-Control', 'public, max-age=3600')
    sendSuccess(res, { theme })
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to get theme', 500)
  }
}
