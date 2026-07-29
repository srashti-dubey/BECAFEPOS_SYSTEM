import { describe, expect, it } from 'vitest'
import { customerFormSchema } from './customerSchema'

// Each field is checked against its own sub-schema (`.shape.<field>`) rather than parsing a
// whole object — that way one field with no safely-generatable case (see below) can't stop the
// rest of the fields from being tested.
describe('customerFormSchema', () => {
  describe('name', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.name.safeParse("Sample")
      expect(result.success).toBe(true)
    })
    it('rejects an invalid value', () => {
      const result = customerFormSchema.shape.name.safeParse("")
      expect(result.success).toBe(false)
    })
  })
  describe('mobile', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.mobile.safeParse("9876543210")
      expect(result.success).toBe(true)
    })
    it('rejects an invalid value', () => {
      const result = customerFormSchema.shape.mobile.safeParse("12345")
      expect(result.success).toBe(false)
    })
  })
  describe('email', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.email.safeParse("email@example.com")
      expect(result.success).toBe(true)
    })
    it('rejects an invalid value', () => {
      const result = customerFormSchema.shape.email.safeParse("not-an-email")
      expect(result.success).toBe(false)
    })
  })
  describe('remarks', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.remarks.safeParse("Sample")
      expect(result.success).toBe(true)
    })
    it('rejects an invalid value', () => {
      const result = customerFormSchema.shape.remarks.safeParse("")
      expect(result.success).toBe(false)
    })
  })
  describe('loyalty_points', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.loyalty_points.safeParse("1")
      expect(result.success).toBe(true)
    })
    it('rejects an invalid value', () => {
      const result = customerFormSchema.shape.loyalty_points.safeParse("not-a-number")
      expect(result.success).toBe(false)
    })
  })
  describe('can_notify', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.can_notify.safeParse("Sample")
      expect(result.success).toBe(true)
    })
    it('rejects an invalid value', () => {
      const result = customerFormSchema.shape.can_notify.safeParse("")
      expect(result.success).toBe(false)
    })
  })
  describe('branch_id', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.branch_id.safeParse("42")
      expect(result.success).toBe(true)
    })
    it('accepts an empty value (optional)', () => {
      const result = customerFormSchema.shape.branch_id.safeParse("")
      expect(result.success).toBe(true)
    })
    it('rejects a non-numeric value', () => {
      const result = customerFormSchema.shape.branch_id.safeParse("Sample")
      expect(result.success).toBe(false)
    })
    it('rejects a value over the max length', () => {
      const result = customerFormSchema.shape.branch_id.safeParse("1".repeat(51))
      expect(result.success).toBe(false)
    })
  })
  describe('status', () => {
    it('accepts a valid value', () => {
      const result = customerFormSchema.shape.status.safeParse("active")
      expect(result.success).toBe(true)
    })
    it('rejects an invalid value', () => {
      const result = customerFormSchema.shape.status.safeParse("not-a-real-option")
      expect(result.success).toBe(false)
    })
  })
})
