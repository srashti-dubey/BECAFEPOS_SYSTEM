export function throttle<T extends (...args: never[]) => unknown>(callback: T, interval = 300) {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall >= interval) {
      lastCall = now
      callback(...args)
    }
  }
}
