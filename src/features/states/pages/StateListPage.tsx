import { useState } from 'react'
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
import { useDynamicColumns } from '@/forms'
import { StateFormModal } from '@/features/states/components/StateFormModal'
import { STATE_STATUS_OPTIONS } from '@/features/states/constants'
import {
  useApproveStateMutation,
  useDeleteStateMutation,
  useExportStatesExcel,
  useStatesQuery,
  useRejectStateMutation,
} from '@/features/states/hooks'
import type { State, StatesListParams, StatesSortField } from '@/features/states/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './StateListPage.module.css'

export default function StateListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'state_name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; state: State | null }>({
    open: false,
    state: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<State | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.states, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.states, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.states, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.states, 'approval')

  const params: StatesListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    status: (status || undefined) as StatesListParams['status'],
    sortBy: sorting[0]?.id as StatesSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const statesQuery = useStatesQuery(params)
  const deleteMutation = useDeleteStateMutation()
  const approveMutation = useApproveStateMutation()
  const rejectMutation = useRejectStateMutation()
  const exportMutation = useExportStatesExcel()

  // Columns come from the same API-fetched form schema as the Add/Edit form (formId
  // "state-form") instead of a fixed set Hygen guessed at generation time — see
  // forms/useDynamicColumns.ts.
  const { columns, isLoading: columnsLoading } = useDynamicColumns<State>({
    formId: 'state-form',
    onView: (record) => navigate(ROUTES.stateDetail(record.id)),
    onEdit: (record) => setFormModal({ open: true, state: record }),
    onDelete: (record) => setDeleteTarget(record),
    onReviewApproval: (approval) => setReviewApproval(approval),
    canUpdate,
    canDelete,
    canApprove,
  })

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
        title="States"
        description="Manage states records."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, state: null })}>Add State</Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search states..."
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
              {STATE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="secondary"
            onClick={() => exportMutation.mutate(params)}
            loading={exportMutation.isPending}
          >
            Export
          </Button>
          <Button
            variant="secondary"
            onClick={() => statesQuery.refetch()}
            loading={statesQuery.isFetching && !statesQuery.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={statesQuery.data?.data ?? []}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={statesQuery.isLoading || columnsLoading}
          isError={statesQuery.isError}
          errorMessage={statesQuery.error instanceof Error ? statesQuery.error.message : undefined}
          onRetry={() => statesQuery.refetch()}
          emptyTitle="No states found"
          emptyDescription="Try adjusting your search or filters."
        />

        {statesQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={statesQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <StateFormModal
        open={formModal.open}
        state={formModal.state}
        onClose={() => setFormModal({ open: false, state: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete state"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.state_name}? This cannot be undone.` : undefined}
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
