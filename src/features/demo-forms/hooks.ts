import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDemoFormCatalog,
  getFormSubmissions,
  submitDynamicForm,
  type DemoFormMeta,
} from '@/mocks/dynamicFormsApi'
import { notificationService } from '@/services/notificationService'

export function useDemoFormCatalogQuery() {
  return useQuery<DemoFormMeta[]>({
    queryKey: ['demo-form-catalog'],
    queryFn: async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 100))
      return getDemoFormCatalog()
    },
  })
}

export function useFormSubmissionsQuery(formId: string) {
  return useQuery<Array<Record<string, unknown> & { id: string }>>({
    queryKey: ['form-submissions', formId],
    queryFn: async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 100))
      return getFormSubmissions(formId)
    },
    enabled: Boolean(formId),
  })
}

export function useSubmitDynamicFormMutation(formId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown> & { formId: string; id?: string }) => {
      return submitDynamicForm(payload)
    },
    onSuccess: () => {
      notificationService.success('Form submitted successfully')
      void queryClient.invalidateQueries({ queryKey: ['form-submissions', formId] })
    },
  })
}
