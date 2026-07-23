import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ invalid = false, className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={[styles.input, invalid ? styles.invalid : '', className].filter(Boolean).join(' ')}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})

Input.displayName = 'Input'
