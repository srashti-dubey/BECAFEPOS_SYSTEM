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
import { DistrictFormModal } from '@/features/districts/components/DistrictFormModal'
import { DISTRICT_STATUS_OPTIONS } from '@/features/districts/constants'
import {
  useApproveDistrictMutation,
  useDeleteDistrictMutation,
  useExportDistrictsExcel,
  useDistrictsQuery,
  useRejectDistrictMutation,
} from '@/features/districts/hooks'
import type { District, DistrictsListParams, DistrictsSortField } from '@/features/districts/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './DistrictListPage.module.css'

export default function DistrictListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'district_name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; district: District | null }>({
    open: false,
    district: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<District | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.districts, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.districts, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.districts, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.districts, 'approval')

  const params: DistrictsListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    status: (status || undefined) as DistrictsListParams['status'],
    sortBy: sorting[0]?.id as DistrictsSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const districtsQuery = useDistrictsQuery(params)
  const deleteMutation = useDeleteDistrictMutation()
  const approveMutation = useApproveDistrictMutation()
  const rejectMutation = useRejectDistrictMutation()
  const exportMutation = useExportDistrictsExcel()

  // Columns come from the same API-fetched form schema as the Add/Edit form (formId
  // "district-form") instead of a fixed set Hygen guessed at generation time — see
  // forms/useDynamicColumns.ts.
  const { columns, isLoading: columnsLoading } = useDynamicColumns<District>({
    formId: 'district-form',
    onView: (record) => navigate(ROUTES.districtDetail(record.id)),
    onEdit: (record) => setFormModal({ open: true, district: record }),
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
        title="Districts"
        description="Manage districts records."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, district: null })}>Add District</Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search districts..."
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
              {DISTRICT_STATUS_OPTIONS.map((option) => (
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
            onClick={() => districtsQuery.refetch()}
            loading={districtsQuery.isFetching && !districtsQuery.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={districtsQuery.data?.data ?? []}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={districtsQuery.isLoading || columnsLoading}
          isError={districtsQuery.isError}
          errorMessage={districtsQuery.error instanceof Error ? districtsQuery.error.message : undefined}
          onRetry={() => districtsQuery.refetch()}
          emptyTitle="No districts found"
          emptyDescription="Try adjusting your search or filters."
        />

        {districtsQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={districtsQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <DistrictFormModal
        open={formModal.open}
        district={formModal.district}
        onClose={() => setFormModal({ open: false, district: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete district"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.district_name}? This cannot be undone.` : undefined}
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
