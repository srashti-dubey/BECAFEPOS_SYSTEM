import type { FieldValues, Path, UseFormRegisterReturn } from 'react-hook-form'
import { useFormContext } from '@/forms/FormContext'
import styles from './FormField.module.css'

type RegisteredField = UseFormRegisterReturn<string> & {
  invalid: boolean
  id: string
  className?: string
}

type FormFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  /** DOM id for the control; defaults to field `name`. */
  id?: string
  /** Extra class on the field wrapper. */
  className?: string
  /** Extra class forwarded to the control via the render-prop. */
  inputClassName?: string
  children: (field: RegisteredField) => React.ReactNode
}

/**
 * Canonical field wrapper: renders label/description/error and wires the child control to
 * react-hook-form via `register` (uncontrolled — avoids a re-render per keystroke).
 */
export function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required = false,
  id,
  className,
  inputClassName,
  children,
}: FormFieldProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>()
  const error = form.formState.errors[name]?.message
  const fieldId = id ?? String(name)

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label ? (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
          {required ? <span className={styles.required}> *</span> : null}
        </label>
      ) : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      {children({
        ...form.register(name),
        id: fieldId,
        invalid: Boolean(error),
        className: inputClassName,
      })}
      {error ? (
        <p className={styles.error} role="alert">
          {String(error)}
        </p>
      ) : null}
    </div>
  )
}
