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
import { CityFormModal } from '@/features/cities/components/CityFormModal'
import { CITY_STATUS_OPTIONS } from '@/features/cities/constants'
import {
  useApproveCityMutation,
  useDeleteCityMutation,
  useExportCitiesExcel,
  useCitiesQuery,
  useRejectCityMutation,
} from '@/features/cities/hooks'
import type { City, CitiesListParams, CitiesSortField } from '@/features/cities/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './CityListPage.module.css'

export default function CityListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; city: City | null }>({
    open: false,
    city: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.cities, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.cities, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.cities, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.cities, 'approval')

  const params: CitiesListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    status: (status || undefined) as CitiesListParams['status'],
    sortBy: sorting[0]?.id as CitiesSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const citiesQuery = useCitiesQuery(params)
  const deleteMutation = useDeleteCityMutation()
  const approveMutation = useApproveCityMutation()
  const rejectMutation = useRejectCityMutation()
  const exportMutation = useExportCitiesExcel()

  // Columns come from the same API-fetched form schema as the Add/Edit form (formId
  // "city-form") instead of a fixed set Hygen guessed at generation time — see
  // forms/useDynamicColumns.ts.
  const { columns, isLoading: columnsLoading } = useDynamicColumns<City>({
    formId: 'city-form',
    onView: (record) => navigate(ROUTES.cityDetail(record.id)),
    onEdit: (record) => setFormModal({ open: true, city: record }),
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
        title="Cities"
        description="Manage cities records."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, city: null })}>Add City</Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search cities..."
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
              {CITY_STATUS_OPTIONS.map((option) => (
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
            onClick={() => citiesQuery.refetch()}
            loading={citiesQuery.isFetching && !citiesQuery.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={citiesQuery.data?.data ?? []}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={citiesQuery.isLoading || columnsLoading}
          isError={citiesQuery.isError}
          errorMessage={citiesQuery.error instanceof Error ? citiesQuery.error.message : undefined}
          onRetry={() => citiesQuery.refetch()}
          emptyTitle="No cities found"
          emptyDescription="Try adjusting your search or filters."
        />

        {citiesQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={citiesQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <CityFormModal
        open={formModal.open}
        city={formModal.city}
        onClose={() => setFormModal({ open: false, city: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete city"
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
