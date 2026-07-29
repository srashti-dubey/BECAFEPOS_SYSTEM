import { z } from 'zod'
import { REGEX } from '@/constants/regex'

export const customerFormSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters'),
  mobile: z.string().trim().min(1, 'Mobile is required').regex(REGEX.phone, 'Mobile is invalid'),
  email: z.string().trim().min(1, 'Email is required').email('Email is invalid'),
  remarks: z.string().trim().min(1, 'Remarks is required').max(200, 'Remarks must be at most 200 characters'),
  loyalty_points: z.string().trim().min(1, 'Loyalty points is required').refine((val) => val === '' || !Number.isNaN(Number(val)), 'Loyalty points must be a valid number').refine((val) => val === '' || Number(val) >= 1, 'Loyalty points must be at least 1').refine((val) => val === '' || Number(val) <= 1000, 'Loyalty points must be at most 1000'),
  can_notify: z.string().trim().min(1, 'Can notify is required').max(200, 'Can notify must be at most 200 characters'),
  branch_id: z
    .string()
    .trim()
    .max(50, 'Branch id must be at most 50 characters')
    .refine((val) => val === '' || /^\d+$/.test(val), 'Branch id must be a number'),
  status: z.enum(["active","inactive"], 'Status is required'),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>
