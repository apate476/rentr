import { z } from 'zod'

export const CreatePropertySchema = z.object({
  address: z.string().min(5, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  zip: z.string().max(20).optional().nullable(),
  country: z.string().default('US'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>
