import { fetchFormSchema as mockFetchFormSchema } from '@/mocks/dynamicFormsApi'
import type { DynamicFormSchema } from '@/forms/dynamicFormTypes'

/**
 * Loads a server-driven form schema by id.
 *
 * Currently bypasses the real API and uses `dynamicFormsApi.ts` until the backend
 * until the backend `/forms/{formId}` endpoint is ready.
 */
export async function fetchFormSchema(formId: string, entityId?: string): Promise<DynamicFormSchema> {
  // TODO: Replace with real API once backend is ready:
  // if (env.VITE_USE_MOCK_API) {
  //   return mockFetchFormSchema(formId, entityId)
  // }
  // const response = await api.get<DynamicFormSchema>(`/forms/${formId}`, {
  //   params: entityId ? { entityId } : undefined,
  // })
  // return response.data

  return mockFetchFormSchema(formId, entityId)
}
