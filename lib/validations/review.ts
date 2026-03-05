import { z } from 'zod'
import { REVIEW_BODY_MIN, REVIEW_BODY_MAX, SCORE_MIN, SCORE_MAX } from '@/lib/constants'

const scoreSchema = z
  .number()
  .int()
  .min(SCORE_MIN, `Score must be at least ${SCORE_MIN}`)
  .max(SCORE_MAX, `Score must be at most ${SCORE_MAX}`)

export const CreateReviewSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  score_overall: scoreSchema,
  score_value: scoreSchema,
  score_landlord: scoreSchema,
  score_noise: scoreSchema,
  score_pests: scoreSchema,
  score_safety: scoreSchema,
  score_parking: scoreSchema,
  score_pets: scoreSchema,
  score_neighborhood: scoreSchema,
  body: z
    .string()
    .min(REVIEW_BODY_MIN, `Review must be at least ${REVIEW_BODY_MIN} characters`)
    .max(REVIEW_BODY_MAX, `Review must be at most ${REVIEW_BODY_MAX} characters`),
  rent_amount: z.number().int().positive().optional().nullable(),
  move_in_year: z.number().int().min(1970).max(new Date().getFullYear()).optional().nullable(),
  move_out_year: z.number().int().min(1970).max(new Date().getFullYear()).optional().nullable(),
  lease_type: z.enum(['month-to-month', '1-year', '2-year', 'other']).optional().nullable(),
  would_rent_again: z.boolean().optional().nullable(),
  turnstile_token: z.string().min(1, 'CAPTCHA verification required'),
})

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
