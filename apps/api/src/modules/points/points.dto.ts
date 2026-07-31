import { z } from 'zod'

export const requestRedemptionSchema = z.object({
  pointsAmount: z.coerce.number().int().positive(),
  contactPhone: z.string().min(6).max(30).optional(),
  contactNote: z.string().max(280).optional(),
})
export type RequestRedemptionDto = z.infer<typeof requestRedemptionSchema>

export const listLedgerSchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type ListLedgerDto = z.infer<typeof listLedgerSchema>

export const listRedemptionsSchema = z.object({
  status: z.enum(['REQUESTED', 'CONTACTED', 'PAID', 'REJECTED']).optional(),
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type ListRedemptionsDto = z.infer<typeof listRedemptionsSchema>

export const resolveRedemptionSchema = z.object({
  status: z.enum(['CONTACTED', 'PAID', 'REJECTED']),
})
export type ResolveRedemptionDto = z.infer<typeof resolveRedemptionSchema>

export const setRoundConfigSchema = z.object({
  roundLabel: z.string().min(1).max(80).optional(),
  targetPoints: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().min(1).max(10).optional(),
  pointsPerCurrencyUnit: z.coerce.number().int().positive().optional(),
})
export type SetRoundConfigDto = z.infer<typeof setRoundConfigSchema>

export const adjustPointsSchema = z.object({
  delta: z.coerce.number().int().refine((n) => n !== 0, 'delta no puede ser 0'),
  note: z.string().max(280).optional(),
})
export type AdjustPointsDto = z.infer<typeof adjustPointsSchema>
