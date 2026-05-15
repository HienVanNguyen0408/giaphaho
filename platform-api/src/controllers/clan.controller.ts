import { Request, Response } from 'express'
import { listClans, createClan, getClanById, updateClan, updateClanStatus, deleteClan } from '../services/clan.service'
import { sendSuccess, sendError } from '../utils/response'
import { createClanSchema, updateClanSchema, updateStatusSchema } from '../validators/clan.validator'

export async function listHandler(req: Request, res: Response): Promise<void> {
  try {
    const { status, licenseType, search, page } = req.query
    const result = await listClans({
      status: status as string,
      licenseType: licenseType as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
    })
    sendSuccess(res, result)
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to list clans', 500)
  }
}

export async function createHandler(req: Request, res: Response): Promise<void> {
  const parsed = createClanSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid input', 400, parsed.error.errors)
    return
  }

  try {
    const result = await createClan(parsed.data)
    sendSuccess(res, result, 201)
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      sendError(res, 'DUPLICATE_CODE', 'Clan code already exists', 409)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to create clan', 500)
    }
  }
}

export async function getOneHandler(req: Request, res: Response): Promise<void> {
  try {
    const clan = await getClanById(req.params.id)
    sendSuccess(res, { clan })
  } catch (err) {
    if (err instanceof Error && err.message === 'CLAN_NOT_FOUND') {
      sendError(res, 'CLAN_NOT_FOUND', 'Clan not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to get clan', 500)
    }
  }
}

export async function updateHandler(req: Request, res: Response): Promise<void> {
  const parsed = updateClanSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid input', 400, parsed.error.errors)
    return
  }

  try {
    const clan = await updateClan(req.params.id, parsed.data)
    sendSuccess(res, { clan })
  } catch (err) {
    if (err instanceof Error && err.message === 'CLAN_NOT_FOUND') {
      sendError(res, 'CLAN_NOT_FOUND', 'Clan not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to update clan', 500)
    }
  }
}

export async function updateStatusHandler(req: Request, res: Response): Promise<void> {
  const parsed = updateStatusSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid input', 400, parsed.error.errors)
    return
  }

  try {
    const clan = await updateClanStatus(req.params.id, parsed.data.status)
    sendSuccess(res, { clan })
  } catch (err) {
    if (err instanceof Error && err.message === 'CLAN_NOT_FOUND') {
      sendError(res, 'CLAN_NOT_FOUND', 'Clan not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to update clan status', 500)
    }
  }
}

export async function deleteHandler(req: Request, res: Response): Promise<void> {
  try {
    await deleteClan(req.params.id)
    sendSuccess(res, { message: 'Clan deleted successfully' })
  } catch (err) {
    if (err instanceof Error && err.message === 'CLAN_NOT_FOUND') {
      sendError(res, 'CLAN_NOT_FOUND', 'Clan not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to delete clan', 500)
    }
  }
}
