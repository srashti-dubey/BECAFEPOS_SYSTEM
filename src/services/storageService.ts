class StorageService {
  private storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  get<T = unknown>(key: string): T | null {
    const value = this.storage.getItem(key)
    return value ? (JSON.parse(value) as T) : null
  }

  set<T = unknown>(key: string, value: T) {
    this.storage.setItem(key, JSON.stringify(value))
  }

  remove(key: string) {
    this.storage.removeItem(key)
  }

  clear() {
    this.storage.clear()
  }
}

export const storageService = new StorageService(localStorage)
export const sessionStorageService = new StorageService(sessionStorage)
