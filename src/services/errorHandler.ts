import axios from 'axios'
import type { ApiEnvelope } from '@/services/baseService'

class ErrorHandler {
  handle(error: unknown) {
    if (axios.isAxiosError(error)) {
      const envelope = error.response?.data as Partial<ApiEnvelope<unknown>> | undefined
      if (envelope?.message) {
        return new Error(envelope.message)
      }
      return new Error(error.message)
    }

    if (error instanceof Error) {
      return error
    }

    return new Error('Unexpected error occurred')
  }
}

export const errorHandler = new ErrorHandler()
