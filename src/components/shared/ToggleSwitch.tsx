import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './ToggleSwitch.module.css'

type ToggleSwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  invalid?: boolean
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ invalid = false, className, checked, ...props }, ref) => {
    return (
      <span className={[styles.switch, invalid ? styles.invalid : '', className].filter(Boolean).join(' ')}>
        <input
          ref={ref}
          type="checkbox"
          className={styles.input}
          checked={checked}
          aria-invalid={invalid || undefined}
          {...props}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
    )
  },
)

ToggleSwitch.displayName = 'ToggleSwitch'
