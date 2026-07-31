import { z } from 'zod'

export const submitScorePredictionSchema = z.object({
  homeScore: z.coerce.number().int().min(0).max(50),
  awayScore: z.coerce.number().int().min(0).max(50),
})
export type SubmitScorePredictionDto = z.infer<typeof submitScorePredictionSchema>

export const setRecommendedScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0).max(50),
  awayScore: z.coerce.number().int().min(0).max(50),
})
export type SetRecommendedScoreDto = z.infer<typeof setRecommendedScoreSchema>

export const rewardTierSchema = z.object({
  rank: z.coerce.number().int().positive(),
  points: z.coerce.number().int().nonnegative(),
})

export const setRewardTiersSchema = z.object({
  tiers: z
    .array(rewardTierSchema)
    .min(1)
    .max(100)
    .refine((tiers) => new Set(tiers.map((t) => t.rank)).size === tiers.length, {
      message: 'No puede haber puestos (rank) repetidos',
    }),
})
export type SetRewardTiersDto = z.infer<typeof setRewardTiersSchema>

export const leaderboardQuerySchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().optional(),
})
export type LeaderboardQueryDto = z.infer<typeof leaderboardQuerySchema>
