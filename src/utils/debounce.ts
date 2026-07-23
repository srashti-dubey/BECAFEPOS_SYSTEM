export function debounce<T extends (...args: never[]) => unknown>(callback: T, delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => callback(...args), delay)
  }
}
