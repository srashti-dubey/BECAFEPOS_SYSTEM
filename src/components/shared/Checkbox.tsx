import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Checkbox.module.css'

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, id, ...props }, ref) => {
  const inputId = id ?? props.name

  const input = (
    <input
      ref={ref}
      id={inputId}
      type="checkbox"
      className={[styles.checkbox, className].filter(Boolean).join(' ')}
      {...props}
    />
  )

  if (!label) {
    return input
  }

  return (
    <label className={styles.label} htmlFor={inputId}>
      {input}
      <span>{label}</span>
    </label>
  )
})

Checkbox.displayName = 'Checkbox'
