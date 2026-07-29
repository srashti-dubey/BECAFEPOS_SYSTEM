import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'
import { useRoutePermissionGuard } from '@/auth/hooks'
import { ApprovalReviewModal } from '@/components/shared/ApprovalReviewModal'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { NetworkStatusBadge } from '@/components/shared/NetworkStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SearchInput } from '@/components/shared/SearchInput'
import { Select } from '@/components/shared/Select'
import { DataTable } from '@/components/table'
import { DEFAULT_PAGE_SIZE } from '@/constants/constants'
import { ROUTES } from '@/constants/routes'
import { createCustomerColumns } from '@/features/customers/components/columns'
import { CustomerFormModal } from '@/features/customers/components/CustomerFormModal'
import { CUSTOMER_STATUS_OPTIONS } from '@/features/customers/constants'
import {
  useApproveCustomerMutation,
  useDeleteCustomerMutation,
  useDeleteLocalCustomerMutation,
  useExportCustomersExcel,
  useCustomersQuery,
  usePendingCustomersQuery,
  useRejectCustomerMutation,
} from '@/features/customers/hooks'
import { customersKeys } from '@/features/customers/hooks/customersKeys'
import { toPendingDisplayCustomer, parsePendingCustomerId } from '@/features/customers/lib/pendingCustomer'
import { syncPendingCustomers } from '@/features/customers/services/customerSyncService'
import type { Customer, CreateCustomerInput, CustomersListParams, CustomersSortField } from '@/features/customers/types'
import { useDebouncedValue } from '@/hooks'
import { notificationService } from '@/services/notificationService'
import type { RecordApproval } from '@/types/approval'
import styles from './CustomerListPage.module.css'

export default function CustomerListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const queryClient = useQueryClient()

  useEffect(() => {
    async function runSync() {
      const result = await syncPendingCustomers()

      if (result.synced > 0 || result.failed > 0) {
        void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
        void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      }
      if (result.synced > 0) {
        notificationService.success(`${result.synced} customer change${result.synced === 1 ? '' : 's'} synced`)
      }
      if (result.failed > 0) {
        notificationService.error(
          `${result.failed} customer change${result.failed === 1 ? '' : 's'} failed to sync — check the console for details`,
        )
      }
    }

    void runSync()

    window.addEventListener('online', runSync)
    return () => window.removeEventListener('online', runSync)
  }, [queryClient])

  const canCreate = useRoutePermissionGuard(ROUTES.customers, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.customers, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.customers, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.customers, 'approval')

  const params: CustomersListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    status: (status || undefined) as CustomersListParams['status'],
    sortBy: sorting[0]?.id as CustomersSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const customersQuery = useCustomersQuery(params)
  const pendingQuery = usePendingCustomersQuery()
  const deleteMutation = useDeleteCustomerMutation()
  const deleteLocalMutation = useDeleteLocalCustomerMutation()
  const approveMutation = useApproveCustomerMutation()
  const rejectMutation = useRejectCustomerMutation()
  const exportMutation = useExportCustomersExcel()

  const pendingOps = useMemo(() => pendingQuery.data ?? [], [pendingQuery.data])

  // Unsynced local drafts have no server id, so they can't be filtered/sorted/paginated by the
  // server — they're only shown prepended on page 1, ahead of whatever the server list returns.
  const pendingCreateRows = useMemo(
    () => pendingOps.filter((op) => op.operation === 'create').map(toPendingDisplayCustomer),
    [pendingOps],
  )

  // Queued edits/deletes target a real customer that's already in the server list, so instead of
  // adding new rows, they're overlaid onto the matching server row by id.
  const pendingUpdatesByCustomerId = useMemo(() => {
    const map = new Map<string, CreateCustomerInput>()
    for (const op of pendingOps) {
      if (op.operation === 'update' && op.customerId && op.data) {
        map.set(op.customerId, op.data)
      }
    }
    return map
  }, [pendingOps])

  const pendingDeleteCustomerIds = useMemo(() => {
    const ids = new Set<string>()
    for (const op of pendingOps) {
      if (op.operation === 'delete' && op.customerId) {
        ids.add(op.customerId)
      }
    }
    return ids
  }, [pendingOps])

  // A queued approve/reject targets the approval *request*, not the customer record itself — a
  // customer can be re-submitted for approval again later, so this is matched against
  // approval.request_id rather than customer id.
  const pendingApprovalRequestIds = useMemo(() => {
    const ids = new Set<number>()
    for (const op of pendingOps) {
      if ((op.operation === 'approve' || op.operation === 'reject') && op.requestId !== undefined) {
        ids.add(op.requestId)
      }
    }
    return ids
  }, [pendingOps])

  const serverRows = useMemo(
    () =>
      (customersQuery.data?.data ?? []).map((record) => {
        if (pendingDeleteCustomerIds.has(record.id)) {
          return { ...record, isPendingDelete: true }
        }
        const queuedUpdate = pendingUpdatesByCustomerId.get(record.id)
        if (queuedUpdate) {
          return { ...record, ...queuedUpdate, isPendingSync: true }
        }
        if (record.approval?.request_id !== undefined && pendingApprovalRequestIds.has(record.approval.request_id)) {
          return { ...record, isPendingApprovalSync: true }
        }
        return record
      }),
    [customersQuery.data, pendingUpdatesByCustomerId, pendingDeleteCustomerIds, pendingApprovalRequestIds],
  )

  const tableData = page === 1 ? [...pendingCreateRows, ...serverRows] : serverRows
  const showTableError = customersQuery.isError && tableData.length === 0

  const columns = useMemo(
    () =>
      createCustomerColumns({
        onView: (record) => navigate(ROUTES.customerDetail(record.id)),
        onEdit: (record) => setFormModal({ open: true, customer: record }),
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
    // A "pending-N" id is a local-only draft with no server id — deleting it just discards the
    // queued create op. Any other customer has a real server id, so the normal delete mutation
    // applies — customerService.remove() decides whether to DELETE on the server or queue it.
    const pendingId = parsePendingCustomerId(deleteTarget.id)
    if (pendingId !== null) {
      await deleteLocalMutation.mutateAsync(pendingId)
    } else {
      await deleteMutation.mutateAsync(deleteTarget.id)
    }
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
        title="Customers"
        description="Manage customers records."
        actions={
          <div className={styles.headerActions}>
            <NetworkStatusBadge />
            {canCreate ? <Button onClick={() => setFormModal({ open: true, customer: null })}>Add Customer</Button> : null}
          </div>
        }
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search customers..."
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
              {CUSTOMER_STATUS_OPTIONS.map((option) => (
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
            onClick={() => customersQuery.refetch()}
            loading={customersQuery.isFetching && !customersQuery.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={tableData}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={customersQuery.isLoading}
          isError={showTableError}
          errorMessage={customersQuery.error instanceof Error ? customersQuery.error.message : undefined}
          onRetry={() => customersQuery.refetch()}
          emptyTitle="No customers found"
          emptyDescription="Try adjusting your search or filters."
        />

        {customersQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={customersQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <CustomerFormModal
        open={formModal.open}
        customer={formModal.customer}
        onClose={() => setFormModal({ open: false, customer: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.name}? This cannot be undone.` : undefined}
        destructive
        loading={
          deleteTarget && parsePendingCustomerId(deleteTarget.id) !== null
            ? deleteLocalMutation.isPending
            : deleteMutation.isPending
        }
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
