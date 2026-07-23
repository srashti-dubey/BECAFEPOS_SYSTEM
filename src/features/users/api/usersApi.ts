import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type { CreateUserInput, UpdateUserInput, User, UserStatus, UsersListParams, UsersListResult } from '@/features/users/types'
import type { RecordApproval } from '@/types/approval'

// Real backend shape, confirmed from a decrypted /users response: ids are bare numbers, role
// comes as role_id/role_name (no fixed enum), and created_at/updated_at are optional.
interface BackendUserRecord {
  id: number | string
  name: string
  email: string
  phone?: string | null
  mobile?: string | null
  role_id?: number | string | null
  role_name?: string | null
  status: string
  // Assigned branches come back as an array of objects (id + branch_name), not bare ids.
  branches?: Array<{ id: number | string; branch_name?: string }> | null
  created_at?: string
  updated_at?: string
  record_approval_status?: string | null
  approval?: RecordApproval | null
}

interface BackendUsersListResult {
  data: BackendUserRecord[]
  pagination: {
    page: number
    per_page: number
    total_records: number
    total_pages: number
  }
}

function toUser(record: BackendUserRecord): User {
  return {
    id: String(record.id),
    name: record.name,
    email: record.email,
    phone: record.phone ?? '',
    mobile: record.mobile ?? '',
    role_id: record.role_id !== undefined && record.role_id !== null ? String(record.role_id) : undefined,
    role_name: record.role_name ?? undefined,
    status: record.status as UserStatus,
    branch_ids: record.branches?.map((branch) => Number(branch.id)) ?? [],
    created_at: record.created_at,
    updated_at: record.updated_at,
    record_approval_status: record.record_approval_status ?? undefined,
    approval: record.approval ?? undefined,
  }
}

function toUsersListResult(raw: BackendUsersListResult): UsersListResult {
  return {
    data: raw.data.map(toUser),
    total: raw.pagination?.total_records ?? raw.data.length,
  }
}

class UsersApi extends BaseService {
  async list(params: UsersListParams) {
    const { status, ...rest } = params
    const raw = await this.get<BackendUsersListResult>(API_ENDPOINTS.users, {
      params: toBackendListQuery(rest, { status }),
    })
    return toUsersListResult(raw)
  }

  async getById(id: string) {
    const raw = await this.get<BackendUserRecord>(API_ENDPOINTS.user(id))
    return toUser(raw)
  }

  create(input: CreateUserInput) {
    return this.post<User>(API_ENDPOINTS.users, input)
  }

  update(input: UpdateUserInput) {
    const { id, ...rest } = input
    return this.put<User>(API_ENDPOINTS.user(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.user(id))
  }
}

export const usersApi = new UsersApi()
