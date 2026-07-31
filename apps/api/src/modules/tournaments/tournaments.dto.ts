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

export const createTournamentSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(['DAILY', 'MONTHLY', 'CUSTOM']),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  entryFeeCents: z.coerce.number().int().nonnegative().optional(),
  prizePoolCents: z.coerce.number().int().nonnegative().optional(),
})
export type CreateTournamentDto = z.infer<typeof createTournamentSchema>

export const updateTournamentSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED', 'SETTLED']).optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  entryFeeCents: z.coerce.number().int().nonnegative().optional(),
  prizePoolCents: z.coerce.number().int().nonnegative().optional(),
})
export type UpdateTournamentDto = z.infer<typeof updateTournamentSchema>
