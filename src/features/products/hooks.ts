import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMockProducts, submitProductForm } from '@/mocks/dynamicFormsApi'
import { notificationService } from '@/services/notificationService'
import type { Product } from '@/features/products/types'

export function useProductsQuery() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 200))
      return getMockProducts() as Product[]
    },
  })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown> & { id?: string }) => {
      return submitProductForm(payload)
    },
    onSuccess: () => {
      notificationService.success('Product created successfully')
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown> & { id?: string }) => {
      return submitProductForm(payload)
    },
    onSuccess: () => {
      notificationService.success('Product updated successfully')
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
