import { z } from 'zod'

export const globalRankingSchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type GlobalRankingDto = z.infer<typeof globalRankingSchema>
