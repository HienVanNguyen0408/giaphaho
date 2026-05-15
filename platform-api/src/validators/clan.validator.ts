import { z } from 'zod'

export const createClanSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Code must be lowercase alphanumeric with hyphens'),
  licenseType: z.enum(['PERMANENT', 'SUBSCRIPTION']),
  subdomain: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

export const updateClanSchema = createClanSchema.partial().omit({ licenseType: true })

export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED']),
})
