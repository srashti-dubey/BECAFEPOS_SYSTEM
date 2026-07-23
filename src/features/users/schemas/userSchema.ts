import { z } from 'zod'
import { REGEX } from '@/constants/regex'
import { createEmailField, createPhoneField, createRequiredStringField } from '@/forms/utils'
import { USER_STATUS_OPTIONS } from '@/features/users/constants'
import type { UserStatus } from '@/features/users/types'

const statusValues = USER_STATUS_OPTIONS.map((option) => option.value) as [UserStatus, ...UserStatus[]]

export const userFormSchema = z.object({
  name: createRequiredStringField('Name').regex(REGEX.name, 'Name can only contain letters, numbers, spaces, underscores, and hyphens'),
  email: createEmailField(),
  password: createRequiredStringField('Password'),
  mobile: createPhoneField(),
  role_id: z.string().trim().min(1, 'Role is required'),
  status: z.enum(statusValues, 'Status is required'),
  // Branch selection is optional — an empty array (no branches) is allowed.
  branch_ids: z.array(z.number()),
})

// Password is only set when creating a user; editing never touches it.
export const userEditFormSchema = userFormSchema.omit({ password: true })

export type UserFormValues = z.infer<typeof userFormSchema>
