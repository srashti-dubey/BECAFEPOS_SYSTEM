import { z } from 'zod'
import { REGEX } from '@/constants/regex'

export function createRequiredStringField(label: string) {
  return z.string().trim().min(1, `${label} is required`)
}

export function createEmailField() {
  return z.string().trim().min(1, 'Email is required').email('Email is invalid')
}

export function createOptionalStringField() {
  return z.string().trim().optional()
}

export function createPasswordField(minLength = 8) {
  return z.string().trim().min(1, 'Password is required').min(minLength, `Password must be at least ${minLength} characters`)
}

export function createPhoneField() {
  return z.string().trim().min(1, 'Phone number is required').regex(REGEX.phone, 'Enter a valid 10-digit phone number')
}

export function createSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema
}
