import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ children, invalid = false, className, ...props }, ref) => {
  return (
    <div className={styles.wrapper}>
      <select
        ref={ref}
        className={[styles.select, invalid ? styles.invalid : '', className].filter(Boolean).join(' ')}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
    </div>
  )
})

Select.displayName = 'Select'
