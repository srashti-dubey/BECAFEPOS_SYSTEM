import { z } from 'zod'
import { VALIDATION_MESSAGES } from '@/forms/validationMessages'
import { VALIDATION_REGISTRY } from '@/forms/validationRegistry'
import type { DynamicFieldConfig, DynamicValidationConfig } from '@/forms/dynamicFormTypes'

/**
 * Resolves a validation failure message in priority order: an inline `customErrorMessage` wins
 * outright; a `messageKey` looks up the frontend-owned VALIDATION_MESSAGES catalog; otherwise
 * `fallback` (a label-specific default computed by the caller) is used. Both `patternKey` and
 * `messageKey` are frontend-only concepts — a real API response never carries the regex or the
 * message text, only the key, so rewording happens in one place (validationMessages.ts) instead
 * of hunting down every field/module that uses the same rule.
 */
function resolveMessage(validations: DynamicValidationConfig, field: DynamicFieldConfig, fallback: string): string {
  if (validations.customErrorMessage) {
    return validations.customErrorMessage
  }

  if (validations.messageKey) {
    const message = VALIDATION_MESSAGES[validations.messageKey]
    if (message) {
      return message
    }
    if (import.meta.env.DEV) {
      console.warn(
        `[dynamicForm] field "${field.name}" references messageKey "${validations.messageKey}", which is missing from VALIDATION_MESSAGES — falling back to the default message.`,
      )
    }
  }

  return fallback
}

function buildFieldSchema(
  field: DynamicFieldConfig,
  registry: Record<string, string> = VALIDATION_REGISTRY,
): z.ZodTypeAny {
  const validations = field.validations ?? {}
  const requiredMessage = resolveMessage(validations, field, `${field.label} is required`)
  const invalidMessage = resolveMessage(validations, field, `${field.label} is invalid`)
  const activePattern = validations.patternKey ? registry[validations.patternKey] : validations.pattern

  // A patternKey with no matching registry entry silently validates as "anything passes"
  // instead of erroring, which hides a typo or a stale key. Surface it loudly in dev instead of
  // failing silently in production forms.
  if (validations.patternKey && !(validations.patternKey in registry) && import.meta.env.DEV) {
    console.warn(
      `[dynamicForm] field "${field.name}" references patternKey "${validations.patternKey}", which is missing from VALIDATION_REGISTRY — that pattern will not be enforced.`,
    )
  }

  if (field.type === 'field-array') {
    const itemSchema = field.subFields?.length
      ? z.object(
          field.subFields.reduce<Record<string, z.ZodTypeAny>>((acc, subField) => {
            acc[subField.name] = buildFieldSchema(subField, registry)
            return acc
          }, {}),
        )
      : z.object({})

    let schema = z.array(itemSchema)

    if (validations.required) {
      schema = schema.min(1, requiredMessage)
    }

    return schema
  }

  if (field.type === 'checkbox' || field.type === 'switch') {
    let schema: z.ZodTypeAny = z.boolean()

    if (validations.required) {
      schema = schema.refine((val) => val === true, { message: requiredMessage })
    }

    return schema
  }

  if (field.type === 'file') {
    let schema: z.ZodTypeAny = z.any()

    if (validations.required) {
      schema = schema.refine(
        (value) => {
          if (value instanceof FileList) return value.length > 0
          if (value instanceof File) return true
          return Boolean(value)
        },
        { message: requiredMessage },
      )
    }

    return schema
  }

  if (field.type === 'multi-select') {
    let schema = z.array(z.string())

    if (validations.required) {
      schema = schema.min(1, { message: requiredMessage })
    }

    return schema
  }

  if (field.type === 'color') {
    return z.string().regex(/^#[0-9A-Fa-f]{6}$/i, invalidMessage)
  }

  if (field.type === 'rating') {
    const min = validations.min ?? (validations.required ? 1 : 0)
    const max = validations.max ?? 5
    let schema = z.coerce.number({ message: invalidMessage })

    schema = schema.min(min, validations.required ? requiredMessage : invalidMessage)
    schema = schema.max(max, invalidMessage)

    if (validations.integer) {
      schema = schema.int(invalidMessage)
    }

    return schema
  }

  if (field.type === 'number' || field.type === 'range' || field.type === 'stepper') {
    let schema = z.coerce.number({
      message: invalidMessage,
    })

    if (validations.integer) {
      schema = schema.int(invalidMessage)
    }

    if (validations.min !== undefined) {
      schema = schema.min(validations.min, invalidMessage)
    }

    if (validations.max !== undefined) {
      schema = schema.max(validations.max, invalidMessage)
    }

    if (validations.required) {
      schema = schema.refine((value) => Number.isFinite(value), { message: requiredMessage })
    }

    return schema
  }

  let schema = z.string().trim()

  if (validations.required) {
    schema = schema.min(1, requiredMessage)
  }

  if (validations.minLength !== undefined) {
    schema = schema.min(
      validations.minLength,
      resolveMessage(validations, field, `${field.label} must be at least ${validations.minLength} characters`),
    )
  }

  if (validations.maxLength !== undefined) {
    schema = schema.max(
      validations.maxLength,
      resolveMessage(validations, field, `${field.label} must be at most ${validations.maxLength} characters`),
    )
  }

  if (activePattern) {
    try {
      schema = schema.regex(new RegExp(activePattern), invalidMessage)
    } catch {
      // ignore invalid regex from schema/registry
    }
  }

  return schema
}

export function generateZodSchema(fields: DynamicFieldConfig[], registry: Record<string, string> = VALIDATION_REGISTRY) {
  const shape = fields.reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
    acc[field.name] = buildFieldSchema(field, registry)
    return acc
  }, {})

  return z.object(shape)
}

function getFallbackDefault(field: DynamicFieldConfig) {
  if (field.type === 'checkbox' || field.type === 'switch') return false
  if (field.type === 'multi-select') return []
  if (field.type === 'color') return '#000000'
  if (field.type === 'number' || field.type === 'range' || field.type === 'stepper') return undefined
  if (field.type === 'rating') return 0
  if (field.type === 'file') return undefined
  return ''
}

export function buildDefaultValues(fields: DynamicFieldConfig[], initialData?: Record<string, unknown> | null) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.type === 'field-array') {
      acc[field.name] = initialData?.[field.name] ?? field.value ?? []
      return acc
    }

    acc[field.name] = initialData?.[field.name] ?? field.value ?? field.defaultValue ?? getFallbackDefault(field)
    return acc
  }, {})
}

export function isFieldRequired(field: DynamicFieldConfig): boolean {
  return Boolean(field.validations?.required)
}

/**
 * Whether `field` should be rendered/validated given the current value of the field its
 * `visibleWhen` rule (if any) depends on. `driverValues` only needs to carry the driver
 * fields' values, not the whole form.
 */
export function isFieldVisible(field: DynamicFieldConfig, driverValues: Record<string, unknown>): boolean {
  const rule = field.visibleWhen
  if (!rule) {
    return true
  }

  const actual = driverValues[rule.field]

  if (rule.equals !== undefined) {
    return actual === rule.equals
  }
  if (rule.notEquals !== undefined) {
    return actual !== rule.notEquals
  }
  if (rule.in !== undefined) {
    return rule.in.includes(actual)
  }

  return true
}

export function getFieldNumberBounds(field: DynamicFieldConfig): { min?: number; max?: number } {
  return {
    min: field.validations?.min,
    max: field.validations?.max,
  }
}

const UNLISTABLE_TYPES_BY_DEFAULT = new Set<DynamicFieldConfig['type']>(['password', 'field-array', 'file'])

/** Whether a schema-driven listing (useDynamicColumns) should render this field as a column. */
export function isFieldListable(field: DynamicFieldConfig): boolean {
  if (field.showInList !== undefined) {
    return field.showInList
  }
  return !UNLISTABLE_TYPES_BY_DEFAULT.has(field.type)
}
