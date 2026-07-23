import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { Button } from '@/components/shared/Button'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { Input } from '@/components/shared/Input'
import { MultiSelectChips } from '@/components/shared/MultiSelectChips'
import { NumberStepper } from '@/components/shared/NumberStepper'
import { Select } from '@/components/shared/Select'
import { StarRating } from '@/components/shared/StarRating'
import { ToggleSwitch } from '@/components/shared/ToggleSwitch'
import { FormField } from '@/forms/FormField'
import { FormProvider } from '@/forms/FormProvider'
import { DynamicFieldArray } from '@/forms/DynamicFieldArray'
import { DynamicOptionsSelect } from '@/forms/DynamicOptionsSelect'
import { DynamicSearchableSelect } from '@/forms/DynamicSearchableSelect'
import {
  buildDefaultValues,
  generateZodSchema,
  getFieldNumberBounds,
  isFieldRequired,
  isFieldVisible,
} from '@/forms/dynamicFormUtils'
import type { DynamicFormSchema } from '@/forms/dynamicFormTypes'
import styles from './DynamicForm.module.css'

// Internal Password Wrapper for isolated toggle state
function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Input type={show ? 'text' : 'password'} {...props} style={{ width: '100%', paddingRight: '4rem' }} />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        style={{
          position: 'absolute',
          right: '10px',
          background: 'transparent',
          border: 'none',
          fontSize: '0.85rem',
          cursor: 'pointer',
          color: 'inherit',
        }}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export type DynamicFormValues = Record<string, unknown>

/** FormField passes `invalid` for shared controls; strip it before spreading onto native DOM nodes. */
function nativeFieldProps<T extends { invalid?: boolean }>({ invalid, ...props }: T) {
  return {
    ...props,
    'aria-invalid': invalid || undefined,
  }
}

export type DynamicFormSubmitContext = {
  formId: string
  schema: DynamicFormSchema
}

export type DynamicFormSubmitHandler = (values: DynamicFormValues, context: DynamicFormSubmitContext) => void | Promise<void>

type DynamicFormProps = {
  schema: DynamicFormSchema
  initialData?: Record<string, unknown> | null
  children?: React.ReactNode
  onSubmit?: DynamicFormSubmitHandler
}

export function DynamicForm({ schema, initialData, children, onSubmit }: DynamicFormProps) {
  const defaultValues = useMemo<DynamicFormValues>(() => {
    return buildDefaultValues(schema.fields, initialData)
  }, [schema.fields, initialData])

  // `compiledSchema` (below) is derived from which fields are currently visible, which in turn
  // needs `form.watch(...)` — but `useForm` needs *a* resolver before `form` exists. Route the
  // resolver through a ref instead: the wrapper function only reads `compiledSchemaRef.current`
  // when RHF actually calls it (on submit/blur/change), by which point the ref assignment below
  // (kept current every render) has long since run. Safe despite the "mutate during render"
  // look — nothing reads the ref during render, only from this event-triggered callback.
  const compiledSchemaRef = useRef(generateZodSchema(schema.fields))
  const resolverRef = useRef<Resolver<DynamicFormValues>>(
    (async (values, context, options) => zodResolver(compiledSchemaRef.current)(values, context, options)) as Resolver<DynamicFormValues>,
  )

  const form = useForm<DynamicFormValues>({
    resolver: resolverRef.current,
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  // Only fields referenced by some other field's `visibleWhen` need watching — subscribing to
  // the whole form here would re-render on every keystroke of every field, not just the ones
  // that gate visibility.
  const visibilityDriverNames = useMemo(
    () => Array.from(new Set(schema.fields.map((field) => field.visibleWhen?.field).filter((name): name is string => Boolean(name)))),
    [schema.fields],
  )
  const driverValues = form.watch(visibilityDriverNames)
  const driverValuesByName = useMemo(
    () => Object.fromEntries(visibilityDriverNames.map((name, index) => [name, driverValues[index]])),
    [visibilityDriverNames, driverValues],
  )

  const visibleFields = useMemo(
    () => schema.fields.filter((field) => isFieldVisible(field, driverValuesByName)),
    [schema.fields, driverValuesByName],
  )

  // A hidden field is excluded from validation entirely (not just skipped-if-empty) — e.g. a
  // required "gstin" gated behind "hasGst" shouldn't block submission while hasGst is false.
  // Its value, if any, stays in form state (register default is shouldUnregister: false) and is
  // still included in the submitted values — callers that need it stripped can do so themselves.
  const compiledSchema = useMemo(() => generateZodSchema(visibleFields), [visibleFields])
  compiledSchemaRef.current = compiledSchema

  async function handleSubmit(values: DynamicFormValues) {
    await onSubmit?.(values, { formId: schema.formId, schema })
  }

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <div className={[styles.form, schema.className].filter(Boolean).join(' ')}>
        {schema.title ? <h2 className={styles.title}>{schema.title}</h2> : null}

        {visibleFields.map((field) => {
          const required = isFieldRequired(field)
          const fieldId = field.id ?? field.name
          const bounds = getFieldNumberBounds(field)

          if (field.type === 'checkbox') {
            return (
              <FormField<DynamicFormValues>
                key={field.name}
                name={field.name}
                id={fieldId}
                className={field.className}
                inputClassName={field.inputClassName}
                required={required}
              >
                {(fieldProps) => (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      {...nativeFieldProps(fieldProps)}
                      checked={Boolean(form.watch(field.name))}
                    />
                    <span>
                      {field.label}
                      {required ? ' *' : ''}
                    </span>
                  </label>
                )}
              </FormField>
            )
          }

          return (
            <FormField<DynamicFormValues>
              key={field.name}
              name={field.name}
              id={fieldId}
              className={field.className}
              inputClassName={field.inputClassName}
              label={field.label}
              required={required}
            >
              {(fieldProps) => {
                if (field.type === 'field-array') {
                  return <DynamicFieldArray name={field.name} subFields={field.subFields ?? []} />
                }

                if (field.type === 'select') {
                  if (field.optionsSource?.searchable) {
                    return <DynamicSearchableSelect field={field} fieldProps={fieldProps} />
                  }
                  if (field.optionsSource) {
                    return <DynamicOptionsSelect field={field} fieldProps={fieldProps} />
                  }
                  return (
                    <Select {...fieldProps}>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )
                }

                if (field.type === 'multi-select') {
                  if (field.optionsSource) {
                    return <DynamicOptionsSelect field={field} fieldProps={fieldProps} multiple />
                  }
                  return (
                    <MultiSelectChips
                      options={field.options ?? []}
                      {...fieldProps}
                      value={(form.watch(field.name) as string[]) ?? []}
                    />
                  )
                }

                if (field.type === 'textarea') {
                  return <textarea rows={3} placeholder={field.placeholder} {...nativeFieldProps(fieldProps)} style={{ width: '100%' }} />
                }

                if (field.type === 'radio') {
                  return (
                    <div className={field.inputClassName} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {field.options?.map((option) => (
                        <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            value={option.value}
                            {...nativeFieldProps(fieldProps)}
                            id={`${fieldId}-${option.value}`}
                            checked={form.watch(field.name) === option.value}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )
                }

                if (field.type === 'range') {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="range"
                        min={bounds.min ?? 0}
                        max={bounds.max ?? 100}
                        {...nativeFieldProps(fieldProps)}
                        style={{ flex: 1 }}
                      />
                      <span>{String(form.watch(field.name) ?? '')}</span>
                    </div>
                  )
                }

                if (field.type === 'color') {
                  return <input type="color" {...nativeFieldProps(fieldProps)} />
                }

                if (field.type === 'number') {
                  return (
                    <Input
                      type="number"
                      placeholder={field.placeholder}
                      min={bounds.min}
                      max={bounds.max}
                      {...fieldProps}
                    />
                  )
                }

                if (field.type === 'password') {
                  return <PasswordInput placeholder={field.placeholder} {...fieldProps} />
                }

                if (field.type === 'stepper') {
                  return <NumberStepper placeholder={field.placeholder} {...fieldProps} min={bounds.min} max={bounds.max} />
                }

                if (field.type === 'switch') {
                  return <ToggleSwitch {...fieldProps} checked={Boolean(form.watch(field.name))} />
                }

                if (field.type === 'file') {
                  return <FileDropzone placeholder={field.placeholder} {...fieldProps} />
                }

                if (field.type === 'rating') {
                  return (
                    <StarRating
                      ref={fieldProps.ref}
                      name={fieldProps.name}
                      id={fieldProps.id}
                      onChange={fieldProps.onChange}
                      onBlur={fieldProps.onBlur}
                      invalid={fieldProps.invalid}
                      className={fieldProps.className}
                      value={Number(form.watch(field.name)) || 0}
                    />
                  )
                }

                return <Input type="text" placeholder={field.placeholder} {...fieldProps} />
              }}
            </FormField>
          )
        })}

        {children ? (
          children
        ) : (
          <div className={styles.actions}>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Submit
            </Button>
          </div>
        )}
      </div>
    </FormProvider>
  )
}