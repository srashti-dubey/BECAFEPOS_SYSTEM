import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SortingState } from '@tanstack/react-table'
import { useRoutePermissionGuard } from '@/auth/hooks'
import { ApprovalReviewModal } from '@/components/shared/ApprovalReviewModal'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SearchInput } from '@/components/shared/SearchInput'
import { Select } from '@/components/shared/Select'
import { DataTable } from '@/components/table'
import { DEFAULT_PAGE_SIZE } from '@/constants/constants'
import { ROUTES } from '@/constants/routes'
import { useApproveRequestMutation, useRejectRequestMutation } from '@/features/approvals/hooks'
import { createUserColumns } from '@/features/users/components/columns'
import { UserFormModal } from '@/features/users/components/UserFormModal'
import { USER_STATUS_OPTIONS } from '@/features/users/constants'
import { useDeleteUserMutation, useUsersQuery } from '@/features/users/hooks'
import type { User, UsersListParams, UsersSortField } from '@/features/users/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './UserListPage.module.css'

export default function UserListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.users, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.users, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.users, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.users, 'approval')

  const params: UsersListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    status: (status || undefined) as UsersListParams['status'],
    sortBy: sorting[0]?.id as UsersSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const usersQuery = useUsersQuery(params)
  const deleteMutation = useDeleteUserMutation()
  const approveMutation = useApproveRequestMutation()
  const rejectMutation = useRejectRequestMutation()

  const columns = useMemo(
    () =>
      createUserColumns({
        onView: (user) => navigate(ROUTES.userDetail(user.id)),
        onEdit: (user) => setFormModal({ open: true, user }),
        onDelete: (user) => setDeleteTarget(user),
        onReviewApproval: (approval) => setReviewApproval(approval),
        canUpdate,
        canDelete,
        canApprove,
      }),
    [navigate, canUpdate, canDelete, canApprove],
  )

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatus(value)
    setPage(1)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  async function handleApprove(requestId: number) {
    await approveMutation.mutateAsync(requestId)
    setReviewApproval(null)
  }

  async function handleReject(requestId: number, comment?: string) {
    await rejectMutation.mutateAsync({ requestId, comment })
    setReviewApproval(null)
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and access."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, user: null })}>Add User</Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />

          <div className={styles.filterItem}>
            <Select value={status} onChange={(event) => handleStatusChange(event.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              {USER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Button variant="secondary" onClick={() => usersQuery.refetch()} loading={usersQuery.isFetching && !usersQuery.isLoading}>
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={usersQuery.data?.data ?? []}
          getRowId={(user) => user.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          errorMessage={usersQuery.error instanceof Error ? usersQuery.error.message : undefined}
          onRetry={() => usersQuery.refetch()}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your search or filters."
        />

        {usersQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={usersQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <UserFormModal open={formModal.open} user={formModal.user} onClose={() => setFormModal({ open: false, user: null })} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.name}? This cannot be undone.` : undefined}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <ApprovalReviewModal
        open={Boolean(reviewApproval)}
        approval={reviewApproval}
        canApprove={canApprove}
        approving={approveMutation.isPending}
        rejecting={rejectMutation.isPending}
        onClose={() => setReviewApproval(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
