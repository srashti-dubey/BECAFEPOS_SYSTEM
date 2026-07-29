import axios from 'axios'
import type { ApiEnvelope } from '@/services/baseService'

// Distinguishes "the server responded with an error" (validation, 4xx/5xx — a real failure that
// should propagate) from "no response was ever received" (DNS/connection failure, backend
// unreachable, timeout — a genuine offline/connectivity condition). Callers that need to decide
// whether to queue an operation locally should check this instead of navigator.onLine, which only
// reflects the network interface's own up/down state and doesn't change just because one request
// failed to reach the server.
export interface ApiError extends Error {
  isNetworkError?: boolean
}

class ErrorHandler {
  handle(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const envelope = error.response?.data as Partial<ApiEnvelope<unknown>> | undefined
      const apiError: ApiError = envelope?.message ? new Error(envelope.message) : new Error(error.message)
      if (!error.response) {
        apiError.isNetworkError = true
      }
      return apiError
    }

    if (error instanceof Error) {
      return error
    }

    return new Error('Unexpected error occurred')
  }
}

export const errorHandler = new ErrorHandler()
