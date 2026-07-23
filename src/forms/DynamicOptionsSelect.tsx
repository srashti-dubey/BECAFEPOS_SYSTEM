import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Select } from '@/components/shared/Select'
import { useFormContext } from '@/forms/FormContext'
import { fetchFieldOptions } from '@/services/dynamicFieldOptionsService'
import type { DynamicFieldConfig } from '@/forms/dynamicFormTypes'

type DynamicOptionsSelectProps = {
  field: DynamicFieldConfig
  fieldProps: UseFormRegisterReturn<string> & { id: string; className?: string }
  multiple?: boolean
}

/**
 * Renders a select/multi-select whose options come from `field.optionsSource` instead of a
 * static `field.options` list. When `optionsSource.dependsOn` is set (e.g. "state" depending on
 * "country"), the field is disabled until the driver field has a value, refetches whenever that
 * value changes, and clears its own selection on that change — the previously-selected state
 * from one country isn't a valid state for a newly-picked country.
 */
export function DynamicOptionsSelect({ field, fieldProps, multiple }: DynamicOptionsSelectProps) {
  const form = useFormContext()
  const source = field.optionsSource
  if (!source) {
    throw new Error(`DynamicOptionsSelect rendered for field "${field.name}" without an optionsSource`)
  }

  const dependsOnValue = source.dependsOn ? form.watch(source.dependsOn) : undefined
  const isGated = Boolean(source.dependsOn) && !dependsOnValue

  const optionsQuery = useQuery({
    queryKey: ['dynamic-field-options', source.url, dependsOnValue],
    queryFn: () => fetchFieldOptions(source, dependsOnValue),
    enabled: !isGated,
  })

  // Skips the reset on the render that introduces this value (mount, or the field just became
  // visible) — only clears the selection when the driver's value actually changes afterward.
  const previousDependsOnValue = useRef(dependsOnValue)
  useEffect(() => {
    if (previousDependsOnValue.current !== dependsOnValue) {
      previousDependsOnValue.current = dependsOnValue
      form.setValue(field.name, multiple ? [] : '')
    }
  }, [dependsOnValue, field.name, form, multiple])

  const options = optionsQuery.data ?? []
  const placeholder = isGated
    ? `Select ${source.dependsOn} first`
    : optionsQuery.isLoading
      ? 'Loading…'
      : (field.placeholder ?? 'Select…')

  // `fieldProps` (register) makes this an uncontrolled input — RHF writes the initial/edit value
  // straight onto the DOM node via its ref, once, when the field first registers or the form
  // resets. If that happens before this field's <option>s exist yet (they're still loading from
  // optionsQuery), the browser has nothing matching to select, and nothing re-applies the value
  // once the options do arrive — the select renders blank even though form state still has the
  // right value internally. Passing `value` here (on top of the spread `onChange`/ref) makes the
  // selection driven by form state on every render instead, the same pattern already used for
  // checkbox/radio fields in DynamicForm.tsx — it naturally lands on the right <option> as soon
  // as the matching one exists, regardless of fetch timing.
  const currentValue = form.watch(field.name)
  const selectValue = multiple
    ? (Array.isArray(currentValue) ? currentValue.map(String) : [])
    : String(currentValue ?? '')

  return (
    <Select {...fieldProps} value={selectValue} multiple={multiple} disabled={isGated || optionsQuery.isLoading}>
      {multiple ? null : <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}
