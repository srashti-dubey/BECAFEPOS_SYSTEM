import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Spinner } from '@/components/shared/Spinner'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading = false, fullWidth = false, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        className={[styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : '', className]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : null}
        <span className={styles.label}>{children}</span>
      </button>
    )
  },
)

Button.displayName = 'Button'
