export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isEmail(value: unknown) {
  return typeof value === 'string' && /.+@.+\..+/.test(value)
}

export function isValidUrl(value: unknown) {
  return typeof value === 'string' && /^https?:\/\//.test(value)
}
