import { z } from 'zod'

export const featureTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})
