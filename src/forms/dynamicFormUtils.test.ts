import { describe, expect, it, vi } from 'vitest'
import { buildDefaultValues, generateZodSchema, isFieldRequired, isFieldVisible } from '@/forms/dynamicFormUtils'
import { VALIDATION_MESSAGES } from '@/forms/validationMessages'

const REGISTRY = {
  email: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
  gstin: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
  phone: '^[0-9]{10}$',
}

describe('generateZodSchema', () => {
  it('uses schema values as defaults for form fields', () => {
    const values = buildDefaultValues([
      {
        name: 'productName',
        label: 'Product name',
        type: 'text',
        value: 'Signature Roast',
      },
      {
        name: 'variants',
        label: 'Variants',
        type: 'field-array',
        value: [{ size: 'M', price: 4.5 }],
      },
    ])

    expect(values.productName).toBe('Signature Roast')
    expect(values.variants).toEqual([{ size: 'M', price: 4.5 }])
  })

  it('builds recursive schemas for field arrays with required validation', () => {
    const schema = generateZodSchema([
      {
        name: 'variants',
        label: 'Variants',
        type: 'field-array',
        validations: { required: true },
        subFields: [
          {
            name: 'size',
            label: 'Size',
            type: 'text',
            validations: { required: true },
          },
          {
            name: 'price',
            label: 'Price',
            type: 'number',
            validations: { required: true },
          },
        ],
      },
    ])

    const validResult = schema.safeParse({ variants: [{ size: 'M', price: 4.5 }] })
    expect(validResult.success).toBe(true)

    const emptyResult = schema.safeParse({ variants: [] })
    expect(emptyResult.success).toBe(false)
    if (!emptyResult.success) {
      expect(emptyResult.error.issues.some((issue) => issue.path.join('.') === 'variants')).toBe(true)
    }
  })

  it('resolves patternKey against the validation registry', () => {
    const schema = generateZodSchema(
      [
        {
          name: 'email',
          label: 'Email',
          type: 'text',
          validations: { required: true, patternKey: 'email', customErrorMessage: 'Invalid email' },
        },
        {
          name: 'gstin',
          label: 'GSTIN',
          type: 'text',
          validations: { required: true, patternKey: 'gstin' },
        },
      ],
      REGISTRY,
    )

    expect(schema.safeParse({ email: 'a@b.com', gstin: '22AAAAA0000A1Z5' }).success).toBe(true)
    expect(schema.safeParse({ email: 'bad', gstin: '22AAAAA0000A1Z5' }).success).toBe(false)
    expect(schema.safeParse({ email: 'a@b.com', gstin: 'invalid' }).success).toBe(false)
  })

  it('falls back to inline pattern when patternKey is not used', () => {
    const schema = generateZodSchema([
      {
        name: 'code',
        label: 'Code',
        type: 'text',
        validations: { required: true, pattern: '^[A-Z]{3}$', customErrorMessage: 'Bad code' },
      },
    ])

    expect(schema.safeParse({ code: 'ABC' }).success).toBe(true)
    expect(schema.safeParse({ code: 'ab' }).success).toBe(false)
  })

  it('warns in dev when a patternKey has no matching registry entry, instead of silently skipping it', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const schema = generateZodSchema(
      [
        {
          name: 'contact_no',
          label: 'Contact number',
          type: 'text',
          validations: { required: true, patternKey: 'not-in-registry' },
        },
      ],
      REGISTRY,
    )

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not-in-registry'))
    // The unresolved pattern isn't enforced — this documents the current (silent-pass) behavior
    // the warning exists to flag, not a desired outcome.
    expect(schema.safeParse({ contact_no: 'not a phone number' }).success).toBe(true)

    warnSpy.mockRestore()
  })
})

describe('messageKey resolution', () => {
  it('resolves messageKey against the central VALIDATION_MESSAGES catalog', () => {
    const schema = generateZodSchema([
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        validations: { required: true, patternKey: 'email', messageKey: 'emailFormat' },
      },
    ])

    const result = schema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(VALIDATION_MESSAGES.emailFormat)
    }
  })

  it('lets an inline customErrorMessage override messageKey', () => {
    const schema = generateZodSchema([
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        validations: { required: true, patternKey: 'email', messageKey: 'emailFormat', customErrorMessage: 'Nope' },
      },
    ])

    const result = schema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nope')
    }
  })

  it('warns in dev when a messageKey has no matching catalog entry, and falls back to the default message', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const schema = generateZodSchema([
      {
        name: 'branch_name',
        label: 'Branch name',
        type: 'text',
        validations: { required: true, messageKey: 'not-in-catalog' },
      },
    ])

    const result = schema.safeParse({ branch_name: '' })
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not-in-catalog'))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Branch name is required')
    }

    warnSpy.mockRestore()
  })
})

describe('isFieldRequired', () => {
  it('reads required from the validation object', () => {
    expect(
      isFieldRequired({
        name: 'email',
        label: 'Email',
        type: 'text',
        validations: { patternKey: 'email' },
      }),
    ).toBe(false)

    expect(
      isFieldRequired({
        name: 'email',
        label: 'Email',
        type: 'text',
        validations: { required: true, patternKey: 'email' },
      }),
    ).toBe(true)
  })
})

describe('isFieldVisible', () => {
  const gstinField = {
    name: 'gstin',
    label: 'GSTIN',
    type: 'text' as const,
    visibleWhen: { field: 'hasGst', equals: true },
  }

  it('is visible when there is no visibleWhen rule', () => {
    expect(isFieldVisible({ name: 'address', label: 'Address', type: 'text' }, {})).toBe(true)
  })

  it('respects an equals rule', () => {
    expect(isFieldVisible(gstinField, { hasGst: true })).toBe(true)
    expect(isFieldVisible(gstinField, { hasGst: false })).toBe(false)
    expect(isFieldVisible(gstinField, {})).toBe(false)
  })

  it('respects a notEquals rule', () => {
    const field = { name: 'other', label: 'Other', type: 'text' as const, visibleWhen: { field: 'category', notEquals: 'none' } }
    expect(isFieldVisible(field, { category: 'coffee' })).toBe(true)
    expect(isFieldVisible(field, { category: 'none' })).toBe(false)
  })

  it('respects an in rule', () => {
    const field = { name: 'other', label: 'Other', type: 'text' as const, visibleWhen: { field: 'category', in: ['coffee', 'tea'] } }
    expect(isFieldVisible(field, { category: 'coffee' })).toBe(true)
    expect(isFieldVisible(field, { category: 'soda' })).toBe(false)
  })
})

describe('rating field schema', () => {
  it('builds without throwing and enforces required min of 1', () => {
    const schema = generateZodSchema([
      {
        name: 'foodQuality',
        label: 'How would you rate your meal today?',
        type: 'rating',
        validations: { required: true },
      },
    ])

    expect(schema.safeParse({ foodQuality: 0 }).success).toBe(false)
    expect(schema.safeParse({ foodQuality: 4 }).success).toBe(true)
  })
})
