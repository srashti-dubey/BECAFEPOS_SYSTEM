import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type SelectHTMLAttributes,
} from 'react'
import styles from './MultiSelectChips.module.css'

export type MultiSelectChipOption = {
  label: string
  value: string
}

type MultiSelectChipsProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple' | 'value' | 'onChange'> & {
  options: MultiSelectChipOption[]
  invalid?: boolean
  value?: string | string[]
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
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

function toSelected(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value) return [value]
  return []
}

export const MultiSelectChips = forwardRef<HTMLSelectElement, MultiSelectChipsProps>(
  (
    {
      options,
      invalid = false,
      className,
      disabled,
      value,
      onChange,
      onBlur,
      name,
      id,
      placeholder = 'Select…',
      ...props
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLSelectElement>(null)
    const listboxId = useId()
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>(() => toSelected(value))

    useEffect(() => {
      if (value !== undefined) {
        setSelected(toSelected(value))
      }
    }, [value])

    useEffect(() => {
      if (!open) return

      function handlePointerDown(event: MouseEvent) {
        if (!rootRef.current?.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      function handleEscape(event: globalThis.KeyboardEvent) {
        if (event.key === 'Escape') setOpen(false)
      }

      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handlePointerDown)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [open])

    function syncSelect(next: string[]) {
      const el = selectRef.current
      if (!el) return
      Array.from(el.options).forEach((option) => {
        option.selected = next.includes(option.value)
      })
      onChange?.({
        target: el,
        currentTarget: el,
        type: 'change',
      } as ChangeEvent<HTMLSelectElement>)
    }

    function commit(next: string[]) {
      setSelected(next)
      syncSelect(next)
    }

    function toggleOption(optionValue: string) {
      if (disabled) return
      if (selected.includes(optionValue)) {
        commit(selected.filter((item) => item !== optionValue))
        return
      }
      commit([...selected, optionValue])
    }

    function handleRemove(optionValue: string) {
      if (disabled) return
      commit(selected.filter((item) => item !== optionValue))
    }

    function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
      if (disabled) return
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOpen(true)
      }
    }

    const selectedOptions = options.filter((option) => selected.includes(option.value))

    return (
      <div ref={rootRef} className={styles.root}>
        <select
          ref={mergeRefs(selectRef, ref)}
          multiple
          className={styles.hiddenSelect}
          name={name}
          id={id}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onBlur={onBlur}
          {...props}
          value={selected}
          onChange={() => undefined}
          tabIndex={-1}
          aria-hidden="true"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div
          className={[styles.control, invalid ? styles.invalid : '', disabled ? styles.disabled : '', open ? styles.open : '', className]
            .filter(Boolean)
            .join(' ')}
          onClick={() => !disabled && setOpen((prev) => !prev)}
        >
          <div className={styles.chips}>
            {selectedOptions.length === 0 ? (
              <span className={styles.placeholder}>{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span key={option.value} className={styles.chip}>
                  <span className={styles.chipLabel}>{option.label}</span>
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Remove ${option.label}`}
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleRemove(option.value)
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          <button
            type="button"
            className={styles.trigger}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            onClick={(event) => {
              event.stopPropagation()
              if (!disabled) setOpen((prev) => !prev)
            }}
            onKeyDown={handleTriggerKeyDown}
          >
            <span className={styles.chevron} aria-hidden="true" />
          </button>
        </div>

        {open ? (
          <ul id={listboxId} className={styles.menu} role="listbox" aria-multiselectable="true">
            {options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={[styles.option, isSelected ? styles.optionSelected : ''].filter(Boolean).join(' ')}
                    onClick={() => toggleOption(option.value)}
                  >
                    <span className={[styles.checkbox, isSelected ? styles.checkboxChecked : ''].filter(Boolean).join(' ')} aria-hidden="true">
                      {isSelected ? '✓' : null}
                    </span>
                    <span className={styles.optionLabel}>{option.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    )
  },
)

MultiSelectChips.displayName = 'MultiSelectChips'
