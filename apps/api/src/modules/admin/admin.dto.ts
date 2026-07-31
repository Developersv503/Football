import { z } from 'zod'

export const listUsersSchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type ListUsersDto = z.infer<typeof listUsersSchema>

export const listAuditLogsSchema = z.object({
  entity: z.string().optional(),
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type ListAuditLogsDto = z.infer<typeof listAuditLogsSchema>

export const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})
export type UpdateUserDto = z.infer<typeof updateUserSchema>
