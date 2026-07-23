// Vite inlines every VITE_-prefixed variable into the built JS bundle at build time — anyone
// can read them via dev tools or "view source." Never put real secrets here (API secret keys,
// DB credentials, signing keys); only public/publishable values belong on this object. A secret
// that a backend needs must live on that backend, never in a VITE_* var.
const appEnv = {
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME ?? 'my-react-app',
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  VITE_API_KEY: import.meta.env.VITE_API_KEY ?? '',
  // 62-unique-character alphabet used by the custom request/response encryption codec.
  // Must match the alphabet the backend was configured with — falls back to the standard
  // ordering when unset so local/dev setups without the real key still work.
  VITE_ENCRYPT_DECRYPT_KEY: import.meta.env.VITE_ENCRYPT_DECRYPT_KEY ?? '',
} as const

export const env = appEnv
