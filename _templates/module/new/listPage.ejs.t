---
to: src/features/<%= folder %>/pages/<%= singular %>ListPage.tsx
---
import { <%= isDynamicForm ? '' : 'useMemo, ' %>useState } from 'react'
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
<%_ if (hasEnumFields) { _%>
import { Select } from '@/components/shared/Select'
<%_ } _%>
import { DataTable } from '@/components/table'
import { DEFAULT_PAGE_SIZE } from '@/constants/constants'
import { ROUTES } from '@/constants/routes'
<%_ if (isDynamicForm) { _%>
import { useDynamicColumns } from '@/forms'
<%_ } else { _%>
import { create<%= singular %>Columns } from '@/features/<%= folder %>/components/columns'
<%_ } _%>
import { <%= singular %>FormModal } from '@/features/<%= folder %>/components/<%= singular %>FormModal'
<%_ if (hasEnumFields) { _%>
import { <%= enumFields.map(function(f) { return f.optionsConstName }).join(', ') %> } from '@/features/<%= folder %>/constants'
<%_ } _%>
import {
  useApprove<%= singular %>Mutation,
  useDelete<%= singular %>Mutation,
  useExport<%= plural %>Excel,
  use<%= plural %>Query,
  useReject<%= singular %>Mutation,
} from '@/features/<%= folder %>/hooks'
import type { <%= singular %>, <%= plural %>ListParams, <%= plural %>SortField } from '@/features/<%= folder %>/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './<%= singular %>ListPage.module.css'

export default function <%= singular %>ListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
<%_ enumFields.forEach(function(field) { _%>
  const [<%= field.name %>, set<%= field.pascal %>] = useState('')
<%_ }) _%>
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: '<%= displayField %>', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; <%= singularCamel %>: <%= singular %> | null }>({
    open: false,
    <%= singularCamel %>: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<<%= singular %> | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.<%= pluralCamel %>, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.<%= pluralCamel %>, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.<%= pluralCamel %>, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.<%= pluralCamel %>, 'approval')

  const params: <%= plural %>ListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
<%_ enumFields.forEach(function(field) { _%>
    <%= field.name %>: (<%= field.name %> || undefined) as <%= plural %>ListParams['<%= field.name %>'],
<%_ }) _%>
    sortBy: sorting[0]?.id as <%= plural %>SortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const <%= pluralCamel %>Query = use<%= plural %>Query(params)
  const deleteMutation = useDelete<%= singular %>Mutation()
  const approveMutation = useApprove<%= singular %>Mutation()
  const rejectMutation = useReject<%= singular %>Mutation()
  const exportMutation = useExport<%= plural %>Excel()

<%_ if (isDynamicForm) { _%>
  // Columns come from the same API-fetched form schema as the Add/Edit form (formId
  // "<%= formId %>") instead of a fixed set Hygen guessed at generation time — see
  // forms/useDynamicColumns.ts.
  const { columns, isLoading: columnsLoading } = useDynamicColumns<<%= singular %>>({
    formId: '<%= formId %>',
    onView: (record) => navigate(ROUTES.<%= singularCamel %>Detail(record.id)),
    onEdit: (record) => setFormModal({ open: true, <%= singularCamel %>: record }),
    onDelete: (record) => setDeleteTarget(record),
    onReviewApproval: (approval) => setReviewApproval(approval),
    canUpdate,
    canDelete,
    canApprove,
  })
<%_ } else { _%>
  const columns = useMemo(
    () =>
      create<%= singular %>Columns({
        onView: (record) => navigate(ROUTES.<%= singularCamel %>Detail(record.id)),
        onEdit: (record) => setFormModal({ open: true, <%= singularCamel %>: record }),
        onDelete: (record) => setDeleteTarget(record),
        onReviewApproval: (approval) => setReviewApproval(approval),
        canUpdate,
        canDelete,
        canApprove,
      }),
    [navigate, canUpdate, canDelete, canApprove],
  )
<%_ } _%>

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

<%_ enumFields.forEach(function(field) { _%>
  function handle<%= field.pascal %>Change(value: string) {
    set<%= field.pascal %>(value)
    setPage(1)
  }

<%_ }) _%>
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
        title="<%= plural %>"
        description="Manage <%= pluralCamel %> records."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, <%= singularCamel %>: null })}>Add <%= singular %></Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search <%= pluralCamel %>..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />

<%_ enumFields.forEach(function(field) { _%>
          <div className={styles.filterItem}>
            <Select
              value={<%= field.name %>}
              onChange={(event) => handle<%= field.pascal %>Change(event.target.value)}
              aria-label="Filter by <%= field.label %>"
            >
              <option value="">All <%= field.label %></option>
              {<%= field.optionsConstName %>.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

<%_ }) _%>
          <Button
            variant="secondary"
            onClick={() => exportMutation.mutate(params)}
            loading={exportMutation.isPending}
          >
            Export
          </Button>
          <Button
            variant="secondary"
            onClick={() => <%= pluralCamel %>Query.refetch()}
            loading={<%= pluralCamel %>Query.isFetching && !<%= pluralCamel %>Query.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={<%= pluralCamel %>Query.data?.data ?? []}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={<%= pluralCamel %>Query.isLoading<%= isDynamicForm ? ' || columnsLoading' : '' %>}
          isError={<%= pluralCamel %>Query.isError}
          errorMessage={<%= pluralCamel %>Query.error instanceof Error ? <%= pluralCamel %>Query.error.message : undefined}
          onRetry={() => <%= pluralCamel %>Query.refetch()}
          emptyTitle="No <%= pluralCamel %> found"
          emptyDescription="Try adjusting your search or filters."
        />

        {<%= pluralCamel %>Query.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={<%= pluralCamel %>Query.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <<%= singular %>FormModal
        open={formModal.open}
        <%= singularCamel %>={formModal.<%= singularCamel %>}
        onClose={() => setFormModal({ open: false, <%= singularCamel %>: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete <%= singularCamel %>"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.<%= displayField %>}? This cannot be undone.` : undefined}
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
