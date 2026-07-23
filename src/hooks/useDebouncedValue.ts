import { useEffect, useState } from 'react'
import { DEFAULT_DEBOUNCE_DELAY } from '@/constants/constants'

export function useDebouncedValue<T>(value: T, delay = DEFAULT_DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeoutId)
  }, [value, delay])

  return debouncedValue
}
