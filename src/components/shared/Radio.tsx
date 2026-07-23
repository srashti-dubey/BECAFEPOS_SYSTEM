import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Radio.module.css'

type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ label, className, id, ...props }, ref) => {
  const inputId = id ?? `${props.name}-${props.value}`

  const input = (
    <input ref={ref} id={inputId} type="radio" className={[styles.radio, className].filter(Boolean).join(' ')} {...props} />
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

Radio.displayName = 'Radio'
