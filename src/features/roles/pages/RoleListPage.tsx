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
import { DataTable } from '@/components/table'
import { DEFAULT_PAGE_SIZE } from '@/constants/constants'
import { ROUTES } from '@/constants/routes'
import { useApproveRequestMutation, useRejectRequestMutation } from '@/features/approvals/hooks'
import { createRoleColumns } from '@/features/roles/components/columns'
import { RoleFormModal } from '@/features/roles/components/RoleFormModal'
import { useDeleteRoleMutation, useRolesQuery } from '@/features/roles/hooks'
import type { Role, RolesListParams, RolesSortField } from '@/features/roles/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './RoleListPage.module.css'

export default function RoleListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.roles, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.roles, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.roles, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.roles, 'approval')

  const params: RolesListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    sortBy: sorting[0]?.id as RolesSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const rolesQuery = useRolesQuery(params)
  const deleteMutation = useDeleteRoleMutation()
  const approveMutation = useApproveRequestMutation()
  const rejectMutation = useRejectRequestMutation()

  const columns = useMemo(
    () =>
      createRoleColumns({
        onView: (record) => navigate(ROUTES.roleDetail(record.id)),
        onEdit: (record) => setFormModal({ open: true, role: record }),
        onDelete: (record) => setDeleteTarget(record),
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
        title="Roles"
        description="Manage roles records."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, role: null })}>Add Role</Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search roles..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />

          <Button
            variant="secondary"
            onClick={() => rolesQuery.refetch()}
            loading={rolesQuery.isFetching && !rolesQuery.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={rolesQuery.data?.data ?? []}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={rolesQuery.isLoading}
          isError={rolesQuery.isError}
          errorMessage={rolesQuery.error instanceof Error ? rolesQuery.error.message : undefined}
          onRetry={() => rolesQuery.refetch()}
          emptyTitle="No roles found"
          emptyDescription="Try adjusting your search or filters."
        />

        {rolesQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={rolesQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <RoleFormModal
        open={formModal.open}
        role={formModal.role}
        onClose={() => setFormModal({ open: false, role: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete role"
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
