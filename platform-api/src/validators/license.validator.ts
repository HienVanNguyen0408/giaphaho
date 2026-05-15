import { z } from 'zod'

export const generateLicenseSchema = z.object({
  expiresAt: z.string().datetime().optional(),
})

export const renewLicenseSchema = z.object({
  months: z.number().int().positive().max(60),
})

export const validateKeySchema = z.object({
  key: z.string().uuid(),
})
