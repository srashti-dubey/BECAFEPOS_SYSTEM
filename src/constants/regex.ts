export const REGEX = {
  email: /.+@.+\..+/,
  url: /^https?:\/\//,
  slug: /^[a-z0-9-]+$/,
  phone: /^[6-9]\d{9}$/,
  name: /^[a-zA-Z0-9\s'_'-]+$/,
} as const
