import { useMutation, useQueryClient } from '@tanstack/react-query'
import { menuService } from '@/features/menus/services/menuService'
import { menusKeys } from '@/features/menus/hooks/menusKeys'
import { notificationService } from '@/services/notificationService'
import type { CreateMenuInput, UpdateMenuInput, Menu, MenusListResult } from '@/features/menus/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreateMenuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMenuInput) => menuService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menusKeys.lists() })
      notificationService.success('Menu created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create menu'))
    },
  })
}

export function useUpdateMenuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMenuInput) => menuService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: menusKeys.detail(input.id) })
      const previousMenu = queryClient.getQueryData<Menu>(menusKeys.detail(input.id))
      // input.parent_id is a raw numeric id; Menu.parent_id is the resolved parent object.
      // There's no client-side lookup to resolve a number against, so parent_id is left
      // untouched here and corrected by the onSettled refetch below.
      const { parent_id: _parentId, ...optimisticFields } = input

      if (previousMenu) {
        queryClient.setQueryData<Menu>(menusKeys.detail(input.id), { ...previousMenu, ...optimisticFields })
      }

      queryClient.setQueriesData<MenusListResult>({ queryKey: menusKeys.lists() }, (current: MenusListResult | undefined) => {
        if (!current) {
          return current
        }
        return {
          ...current,
          data: current.data.map((record) => (record.id === input.id ? { ...record, ...optimisticFields } : record)),
        }
      })

      return { previousMenu }
    },
    onError: (error, input, context) => {
      if (context?.previousMenu) {
        queryClient.setQueryData(menusKeys.detail(input.id), context.previousMenu)
      }
      void queryClient.invalidateQueries({ queryKey: menusKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update menu'))
    },
    onSuccess: (updatedMenu) => {
      queryClient.setQueryData(menusKeys.detail(updatedMenu.id), updatedMenu)
      notificationService.success('Menu updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: menusKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: menusKeys.lists() })
    },
  })
}

export function useDeleteMenuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => menuService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menusKeys.lists() })
      notificationService.success('Menu deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete menu'))
    },
  })
}
