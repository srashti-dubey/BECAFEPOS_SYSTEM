export function setStorageItem(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStorageItem<T = unknown>(key: string): T | null {
  const item = localStorage.getItem(key)
  return item ? (JSON.parse(item) as T) : null
}

export function removeStorageItem(key: string) {
  localStorage.removeItem(key)
}
