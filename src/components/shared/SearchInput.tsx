import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './SearchInput.module.css'

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ className, ...props }, ref) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon} aria-hidden="true" />
      <input ref={ref} type="search" className={[styles.input, className].filter(Boolean).join(' ')} {...props} />
    </div>
  )
})

SearchInput.displayName = 'SearchInput'
