import { z } from 'zod'

export const menuFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  route: z.string().trim().min(1, 'Route is required').regex(/^\/[a-zA-Z0-9\-]+(\/[a-zA-Z0-9\-]+)*\/?$/, 'Route format is invalid'),
  parent_id: z.string().trim().min(1, 'Parent menu is required'),
  // parent_id: z.string().trim().min(1, 'Parent menu is required').refine((val) => val === '' || !Number.isNaN(Number(val)), 'Parent must be a valid number').refine((val) => val === '' || Number(val) >= 1, 'Parent must be at least 1'),
  sort_order: z.string().trim().min(1, 'Sort order is required').refine((val) => val === '' || !Number.isNaN(Number(val)), 'Sort order must be a valid number').refine((val) => val === '' || Number(val) >= 1, 'Sort order must be at least 1'),
  is_active: z.boolean(),
})

export type MenuFormValues = z.infer<typeof menuFormSchema>
