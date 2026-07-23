import { z } from 'zod'

export const roleFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  description: z.string().trim().min(1, 'Description is required'),
  is_active: z.boolean(),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
