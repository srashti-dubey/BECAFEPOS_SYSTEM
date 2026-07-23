import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react'
import styles from './StarRating.module.css'

const STAR_COUNT = 5

type StarRatingProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'max' | 'min'> & {
  invalid?: boolean
  value?: number | string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  /** Number of stars to render. Defaults to 5. */
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

function toRating(value: number | string | undefined): number {
  const next = Number(value)
  return Number.isFinite(next) && next > 0 ? next : 0
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 2.5l2.74 5.55 6.13.89-4.43 4.32 1.05 6.1L12 16.6l-5.49 2.76 1.05-6.1L3.13 8.94l6.13-.89L12 2.5z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const StarRating = forwardRef<HTMLInputElement, StarRatingProps>(
  (
    {
      invalid = false,
      className,
      disabled,
      value,
      onChange,
      onBlur,
      name,
      id,
      max = STAR_COUNT,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [rating, setRating] = useState(() => toRating(value))
    const [hovered, setHovered] = useState(0)
    const starTotal = Math.max(1, Math.min(10, max))

    useEffect(() => {
      if (value === undefined) return
      const next = toRating(value)
      setRating(next)
      if (inputRef.current) {
        inputRef.current.value = next ? String(next) : ''
      }
    }, [value])

    function commit(next: number) {
      setRating(next)
      const el = inputRef.current
      if (!el) return
      el.value = String(next)
      onChange?.({
        target: el,
        currentTarget: el,
        type: 'change',
      } as ChangeEvent<HTMLInputElement>)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, star: number) {
      if (disabled) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault()
        commit(Math.min(starTotal, Math.max(1, rating || star) + 1))
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault()
        commit(Math.max(1, (rating || star) - 1))
      }
      if (event.key === 'Home') {
        event.preventDefault()
        commit(1)
      }
      if (event.key === 'End') {
        event.preventDefault()
        commit(starTotal)
      }
    }

    const preview = hovered || rating

    return (
      <div className={[styles.root, invalid ? styles.invalid : '', className].filter(Boolean).join(' ')}>
        <input
          ref={mergeRefs(inputRef, ref)}
          type="number"
          className={styles.hiddenInput}
          {...props}
          name={name}
          id={id}
          min={0}
          max={starTotal}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          defaultValue={rating || ''}
          onBlur={onBlur}
          tabIndex={-1}
          readOnly
        />

        <div
          className={styles.stars}
          role="radiogroup"
          aria-label="Rating"
          onMouseLeave={() => setHovered(0)}
        >
          {Array.from({ length: starTotal }, (_, index) => {
            const star = index + 1
            const active = star <= preview
            return (
              <button
                key={star}
                type="button"
                className={[styles.star, active ? styles.starActive : ''].filter(Boolean).join(' ')}
                disabled={disabled}
                aria-label={`${star} star${star === 1 ? '' : 's'}`}
                aria-checked={rating === star}
                role="radio"
                onMouseEnter={() => !disabled && setHovered(star)}
                onFocus={() => !disabled && setHovered(star)}
                onBlur={() => setHovered(0)}
                onClick={() => commit(star)}
                onKeyDown={(event) => handleKeyDown(event, star)}
              >
                <StarIcon filled={active} />
              </button>
            )
          })}
        </div>
      </div>
    )
  },
)

StarRating.displayName = 'StarRating'