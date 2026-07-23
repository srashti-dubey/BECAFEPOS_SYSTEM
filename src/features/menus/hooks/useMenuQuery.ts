import { useQuery } from '@tanstack/react-query'
import { menuService } from '@/features/menus/services/menuService'
import { menusKeys } from '@/features/menus/hooks/menusKeys'

export function useMenuQuery(id: string | undefined) {
  return useQuery({
    queryKey: menusKeys.detail(id ?? ''),
    queryFn: () => menuService.getById(id as string),
    enabled: Boolean(id),
  })
}
