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
import { createBranchColumns } from '@/features/branches/components/columns'
import { BranchFormModal } from '@/features/branches/components/BranchFormModal'
import { BRANCH_STATUS_OPTIONS } from '@/features/branches/constants'
import {
  useApproveBranchMutation,
  useBranchesQuery,
  useDeleteBranchMutation,
  useRejectBranchMutation,
} from '@/features/branches/hooks'
import type { Branch, BranchesListParams, BranchesSortField } from '@/features/branches/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './BranchListPage.module.css'

export default function BranchListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'branch_name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.branches, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.branches, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.branches, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.branches, 'approval')

  const params: BranchesListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    status: (status || undefined) as BranchesListParams['status'],
    sortBy: sorting[0]?.id as BranchesSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const branchesQuery = useBranchesQuery(params)
  const deleteMutation = useDeleteBranchMutation()
  const approveMutation = useApproveBranchMutation()
  const rejectMutation = useRejectBranchMutation()

  const columns = useMemo(
    () =>
      createBranchColumns({
        onView: (record) => navigate(ROUTES.branchDetail(record.id)),
        onEdit: (record) => setFormModal({ open: true, branch: record }),
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
        title="Branches"
        description="Manage branches records."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, branch: null })}>Add Branch</Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search branches..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />

          <div className={styles.filterItem}>
            <Select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              aria-label="Filter by Status"
            >
              <option value="">All Status</option>
              {BRANCH_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="secondary"
            onClick={() => branchesQuery.refetch()}
            loading={branchesQuery.isFetching && !branchesQuery.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={branchesQuery.data?.data ?? []}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={branchesQuery.isLoading}
          isError={branchesQuery.isError}
          errorMessage={branchesQuery.error instanceof Error ? branchesQuery.error.message : undefined}
          onRetry={() => branchesQuery.refetch()}
          emptyTitle="No branches found"
          emptyDescription="Try adjusting your search or filters."
        />

        {branchesQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={branchesQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <BranchFormModal
        open={formModal.open}
        branch={formModal.branch}
        onClose={() => setFormModal({ open: false, branch: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete branch"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.branch_name}? This cannot be undone.` : undefined}
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
