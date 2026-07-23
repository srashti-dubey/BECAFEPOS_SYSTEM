import { usersApi } from '@/features/users/api/usersApi'
import type { CreateUserInput, UpdateUserInput, UsersListParams } from '@/features/users/types'

export const userService = {
  list: (params: UsersListParams) => usersApi.list(params),
  getById: (id: string) => usersApi.getById(id),
  create: (input: CreateUserInput) => usersApi.create(input),
  update: (input: UpdateUserInput) => usersApi.update(input),
  remove: (id: string) => usersApi.remove(id),
}
