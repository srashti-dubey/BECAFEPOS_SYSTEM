/**
 * Vite/SPA-flavored custom encrypt/decrypt helpers for talking directly to the backend.
 *
 * This app has no BFF layer sitting between the browser and the real API, so it plays the
 * role the reference Next.js architecture gave its server-side proxy: every request body and
 * query gets wrapped into request_data, and response_data comes back decrypted/reshaped into
 * the existing { success, message, data } envelope that BaseService already expects.
 */

import { env } from '@/config/env'
import {
  appendEncryptedQueryToUrl as appendEncryptedQueryToUrlCore,
  buildEncryptedRequestBody as buildEncryptedRequestBodyCore,
  CUSTOM_REQUEST_DATA_FIELD,
  CUSTOM_RESPONSE_DATA_FIELD,
  decryptCustomPayload as decryptCustomPayloadCore,
  encryptCustomToken as encryptCustomTokenCore,
} from './customEncryptCore'

export { CUSTOM_REQUEST_DATA_FIELD, CUSTOM_RESPONSE_DATA_FIELD }

const DEFAULT_ENCRYPT_DECRYPT_KEY = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function getEncryptDecryptKey(): string {
  return env.VITE_ENCRYPT_DECRYPT_KEY?.trim() || DEFAULT_ENCRYPT_DECRYPT_KEY
}

export function encryptCustomToken(inputString: string, slug?: string): string {
  return encryptCustomTokenCore(getEncryptDecryptKey(), inputString, slug)
}

export function decryptCustomPayload(token: string): unknown {
  return decryptCustomPayloadCore(getEncryptDecryptKey(), token)
}

export function buildEncryptedRequestBody(payload: unknown): Record<string, string> {
  return buildEncryptedRequestBodyCore(getEncryptDecryptKey(), payload)
}

export function appendEncryptedQueryToUrl(url: string, payload: unknown): string {
  return appendEncryptedQueryToUrlCore(getEncryptDecryptKey(), url, payload)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Decrypt a response body's response_data field and reshape it into the plain
 * { success, message, data } envelope the rest of the app already expects.
 * Bodies without response_data (e.g. an endpoint not yet wired for encryption) pass through as-is.
 */
export function unwrapEncryptedResponse(body: unknown): unknown {
  if (!isRecord(body)) {
    return body
  }

  const encrypted = body[CUSTOM_RESPONSE_DATA_FIELD]
  if (typeof encrypted !== 'string' || !encrypted.trim()) {
    return body
  }

  const success = body.success !== false
  const decrypted = decryptCustomPayload(encrypted.trim())

  if (!isRecord(decrypted)) {
    return { success, message: body.message, data: decrypted }
  }

  return {
    success,
    message: typeof decrypted.message === 'string' ? decrypted.message : body.message,
    data: decrypted.data,
    ...(decrypted.errors !== undefined ? { errors: decrypted.errors } : {}),
    // The backend includes the caller's own action flags for the endpoint just hit
    // (e.g. { menu: '/admin/rbac-permissions', view: true, edit: true, ... }) on most
    // encrypted responses — this was previously dropped silently.
    ...(decrypted.permissions !== undefined ? { permissions: decrypted.permissions } : {}),
  }
}
