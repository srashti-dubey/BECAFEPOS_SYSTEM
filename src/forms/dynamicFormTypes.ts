export type DynamicFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'password'
  | 'field-array'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'multi-select'
  | 'range'
  | 'color'
  | 'switch'
  | 'stepper'
  | 'file'
  | 'rating'

export interface DynamicFieldOption {
  label: string
  value: string
}

/**
 * Sources a select/multi-select field's options from an API endpoint instead of a static
 * `options` array — for reference data (countries, states, active branches, ...) that's too
 * large, too dynamic, or too shared to duplicate into every form schema.
 */
export interface DynamicOptionsSource {
  /** Endpoint to fetch options from. Resolved through `fetchFieldOptions` (services/dynamicFieldOptionsService), not `field.optionsSource.url` directly. */
  url: string
  /** Name of another field in this form that gates and parameterizes this fetch (e.g. "country" for a "state" field). Omit for a field with no dependency. */
  dependsOn?: string
  /** Query param name the dependency's value is sent under. Defaults to `dependsOn`. */
  dependsOnParam?: string
  /**
   * When true, the field renders as a typeahead combobox: the user types to filter, and options
   * are re-fetched (debounced) with the query appended as `searchParam` (default `search`).
   */
  searchable?: boolean
  /** Query param name for the typeahead search string. Defaults to `search`. */
  searchParam?: string
  /** Key to read the option label from when the endpoint doesn't already return `{label, value}`. */
  labelKey?: string
  /** Key to read the option value from when the endpoint doesn't already return `{label, value}`. */
  valueKey?: string
}

/**
 * Gates whether a field is rendered/validated based on another field's current value —
 * e.g. only show/require "gstin" when "hasGst" is checked. Exactly one of `equals`/`notEquals`/`in`
 * should be set; if more than one is set they're evaluated in that order.
 */
export interface DynamicVisibilityRule {
  /** Name of the field whose value this rule reads. */
  field: string
  equals?: unknown
  notEquals?: unknown
  in?: unknown[]
}

export interface DynamicValidationConfig {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  integer?: boolean
  /** Hardcoded regex source string */
  pattern?: string
  /** Key into the frontend-owned VALIDATION_REGISTRY (forms/validationRegistry.ts) — never sent by the API. */
  patternKey?: string
  /** Key into the frontend-owned VALIDATION_MESSAGES (forms/validationMessages.ts) — never sent by the API. Takes precedence over the field's auto-generated default message; `customErrorMessage` takes precedence over both. */
  messageKey?: string
  /** Literal message text. Prefer `messageKey` when the same message is used by more than one field/form. */
  customErrorMessage?: string
}

export interface DynamicFieldConfig {
  name: string
  label: string
  type: DynamicFieldType
  /** DOM id for the control (and label htmlFor). Falls back to `name` when omitted. */
  id?: string
  /** Extra class on the field wrapper (for form-level styling hooks). */
  className?: string
  /** Extra class on the input/control element. */
  inputClassName?: string
  placeholder?: string
  defaultValue?: string | number | boolean | string[] | null
  value?: unknown
  /** Static options for select/multi-select/radio. Ignored on a field that also sets `optionsSource`. */
  options?: DynamicFieldOption[]
  /** Fetches select/multi-select options from an API instead of using `options`. */
  optionsSource?: DynamicOptionsSource
  /** Hides this field (and skips its validation) unless the rule matches the current form values. */
  visibleWhen?: DynamicVisibilityRule
  /**
   * Whether a listing built from this schema (see forms/useDynamicColumns.ts) should show this
   * field as a table column. Defaults to true for every type except `password` and
   * `field-array`, which are excluded by default since they're rarely meaningful in a table —
   * set this explicitly to override either direction.
   */
  showInList?: boolean
  validations?: DynamicValidationConfig
  subFields?: DynamicFieldConfig[]
}

export interface DynamicFormSchema {
  formId: string
  title?: string
  submitUrl?: string
  /** Optional class on the form root for page-specific styling. */
  className?: string
  fields: DynamicFieldConfig[]
}
