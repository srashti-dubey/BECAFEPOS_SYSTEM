import { forwardRef, type TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ invalid = false, className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={[styles.textarea, invalid ? styles.invalid : '', className].filter(Boolean).join(' ')}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'
