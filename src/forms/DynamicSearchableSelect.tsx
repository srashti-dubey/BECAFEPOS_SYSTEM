import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { useDebouncedValue } from '@/hooks'
import { useFormContext } from '@/forms/FormContext'
import { fetchFieldOptions } from '@/services/dynamicFieldOptionsService'
import type { DynamicFieldConfig, DynamicFieldOption } from '@/forms/dynamicFormTypes'
import styles from './DynamicSearchableSelect.module.css'

type DynamicSearchableSelectProps = {
  field: DynamicFieldConfig
  fieldProps: UseFormRegisterReturn<string> & { id: string; className?: string; invalid?: boolean }
}

/**
 * Typeahead select backed by `field.optionsSource`. Typing re-fetches options (debounced) with
 * the query sent as `optionsSource.searchParam` (default `search`). Supports the same
 * `dependsOn` gating as `DynamicOptionsSelect`.
 */
export function DynamicSearchableSelect({ field, fieldProps }: DynamicSearchableSelectProps) {
  const form = useFormContext()
  const source = field.optionsSource
  if (!source) {
    throw new Error(`DynamicSearchableSelect rendered for field "${field.name}" without an optionsSource`)
  }

  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)

  const dependsOnValue = source.dependsOn ? form.watch(source.dependsOn) : undefined
  const isGated = Boolean(source.dependsOn) && !dependsOnValue
  const selectedValue = String(form.watch(field.name) ?? '')

  const optionsQuery = useQuery({
    queryKey: ['dynamic-field-options', source.url, dependsOnValue, debouncedQuery],
    queryFn: () => fetchFieldOptions(source, dependsOnValue, debouncedQuery),
    enabled: !isGated && open,
  })
  const options = optionsQuery.data ?? []

  const previousDependsOnValue = useRef(dependsOnValue)
  useEffect(() => {
    if (previousDependsOnValue.current !== dependsOnValue) {
      previousDependsOnValue.current = dependsOnValue
      form.setValue(field.name, '')
      setSelectedLabel('')
      setQuery('')
    }
  }, [dependsOnValue, field.name, form])

  useEffect(() => {
    if (!selectedValue) {
      setSelectedLabel('')
      return
    }

    const match = options.find((option) => option.value === selectedValue)
    if (match) {
      setSelectedLabel(match.label)
    } else {
      setSelectedLabel((current) => current || selectedValue)
    }
  }, [selectedValue, options])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function selectOption(option: DynamicFieldOption) {
    form.setValue(field.name, option.value, { shouldValidate: true, shouldDirty: true })
    setSelectedLabel(option.label)
    setQuery('')
    setOpen(false)
  }

  function handleInputChange(value: string) {
    setQuery(value)
    if (!open) {
      setOpen(true)
    }
    // Clear the committed value once the user starts editing so a stale selection isn't kept.
    if (selectedValue) {
      form.setValue(field.name, '', { shouldDirty: true })
      setSelectedLabel('')
    }
  }

  const displayValue = open ? query : selectedLabel || selectedValue
  const placeholder = isGated
    ? `Select ${source.dependsOn} first`
    : (field.placeholder ?? 'Type to search…')

  const { name, ref, id, className, invalid } = fieldProps

  return (
    <div ref={rootRef} className={styles.root}>
      <input type="hidden" name={name} ref={ref} value={selectedValue} readOnly />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        className={[styles.input, invalid ? styles.invalid : '', className].filter(Boolean).join(' ')}
        placeholder={placeholder}
        disabled={isGated}
        value={displayValue}
        autoComplete="off"
        onFocus={() => {
          if (!isGated) {
            setOpen(true)
          }
        }}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false)
            setQuery('')
          }
        }}
      />

      {open && !isGated ? (
        <ul id={listboxId} role="listbox" className={styles.listbox}>
          {optionsQuery.isFetching ? (
            <li className={styles.status} role="presentation">
              Loading…
            </li>
          ) : null}

          {!optionsQuery.isFetching && options.length === 0 ? (
            <li className={styles.status} role="presentation">
              {debouncedQuery ? 'No matches' : 'No options'}
            </li>
          ) : null}

          {!optionsQuery.isFetching
            ? options.map((option) => (
                <li key={option.value} role="option" aria-selected={option.value === selectedValue}>
                  <button type="button" className={styles.option} onMouseDown={(event) => event.preventDefault()} onClick={() => selectOption(option)}>
                    {option.label}
                  </button>
                </li>
              ))
            : null}
        </ul>
      ) : null}
    </div>
  )
}
