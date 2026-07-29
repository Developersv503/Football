import { z } from 'zod'

export const listTournamentsSchema = z.object({
  status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED', 'SETTLED']).optional(),
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type ListTournamentsDto = z.infer<typeof listTournamentsSchema>

export const leaderboardSchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type LeaderboardDto = z.infer<typeof leaderboardSchema>
