// Decodes a JWT's payload segment client-side — no signature verification, since that's the
// backend's job; the frontend only reads the claims to populate the signed-in user's profile,
// the same trust boundary as reading any other field off the login response body.
export interface AccessTokenClaims {
  userId: number
  email: string
  role: string
  exp: number
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

export function decodeAccessToken(token: string): AccessTokenClaims {
  const segments = token.split('.')
  if (segments.length !== 3) {
    throw new Error('Malformed access token')
  }
  return JSON.parse(base64UrlDecode(segments[1])) as AccessTokenClaims
}
