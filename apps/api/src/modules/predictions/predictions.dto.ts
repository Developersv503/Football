import { z } from 'zod'

export const createPredictionSchema = z.object({
  eventId: z.string(),
  outcome: z.enum(['HOME', 'DRAW', 'AWAY']),
})
export type CreatePredictionDto = z.infer<typeof createPredictionSchema>

export const listMyPredictionsSchema = z.object({
  status: z.enum(['PENDING', 'WON', 'LOST', 'VOID']).optional(),
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type ListMyPredictionsDto = z.infer<typeof listMyPredictionsSchema>
