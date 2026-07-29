import { z } from 'zod'

export const listEventsSchema = z.object({
  sportKey: z.string().optional(),
  competitionId: z.string().optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type ListEventsDto = z.infer<typeof listEventsSchema>
