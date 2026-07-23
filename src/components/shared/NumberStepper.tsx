import { forwardRef, useRef, type InputHTMLAttributes, type ChangeEvent } from 'react'
import styles from './NumberStepper.module.css'

type NumberStepperProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  invalid?: boolean
  min?: number
  max?: number
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

export const NumberStepper = forwardRef<HTMLInputElement, NumberStepperProps>(
  ({ invalid = false, min, max, className, disabled, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    function clamp(value: number) {
      let next = value
      if (min !== undefined && Number.isFinite(min)) next = Math.max(min, next)
      if (max !== undefined && Number.isFinite(max)) next = Math.min(max, next)
      return next
    }

    function commit(next: number) {
      const el = inputRef.current
      if (!el) return
      el.value = String(next)
      onChange?.({
        target: el,
        currentTarget: el,
        type: 'change',
      } as ChangeEvent<HTMLInputElement>)
    }

    function bump(delta: number) {
      if (disabled) return
      const el = inputRef.current
      if (!el) return
      const current = el.value === '' ? (min ?? 0) : Number(el.value)
      const base = Number.isFinite(current) ? current : (min ?? 0)
      commit(clamp(base + delta))
    }

    return (
      <div
        className={[styles.stepper, invalid ? styles.invalid : '', disabled ? styles.disabled : '', className]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          type="button"
          className={styles.button}
          aria-label="Decrease"
          disabled={disabled}
          onClick={() => bump(-1)}
          tabIndex={-1}
        >
          −
        </button>
        <input
          ref={mergeRefs(inputRef, ref)}
          type="number"
          className={styles.input}
          min={min}
          max={max}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          {...props}
          onChange={onChange}
        />
        <button
          type="button"
          className={styles.button}
          aria-label="Increase"
          disabled={disabled}
          onClick={() => bump(1)}
          tabIndex={-1}
        >
          +
        </button>
      </div>
    )
  },
)

NumberStepper.displayName = 'NumberStepper'
