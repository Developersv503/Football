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

// Corrección manual — cuando el feed de Sportradar viene mal, atrasado, o
// el partido no viene de Sportradar (cargado a mano). No dispara settle acá:
// el cron de liquidación recoge FINISHED con marcador cargado en su próxima corrida.
export const adminUpdateEventSchema = z.object({
  status: z.enum(['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED']).optional(),
  homeScore: z.coerce.number().int().nonnegative().nullable().optional(),
  awayScore: z.coerce.number().int().nonnegative().nullable().optional(),
})
export type AdminUpdateEventDto = z.infer<typeof adminUpdateEventSchema>
