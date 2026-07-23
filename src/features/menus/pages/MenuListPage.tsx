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
import { createMenuColumns } from '@/features/menus/components/columns'
import { MenuFormModal } from '@/features/menus/components/MenuFormModal'
import { useDeleteMenuMutation, useMenusQuery } from '@/features/menus/hooks'
import type { Menu, MenusListParams, MenusSortField } from '@/features/menus/types'
import { useDebouncedValue } from '@/hooks'
import type { RecordApproval } from '@/types/approval'
import styles from './MenuListPage.module.css'

export default function MenuListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [formModal, setFormModal] = useState<{ open: boolean; menu: Menu | null }>({
    open: false,
    menu: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null)
  const [reviewApproval, setReviewApproval] = useState<RecordApproval | null>(null)

  const canCreate = useRoutePermissionGuard(ROUTES.menus, 'add')
  const canUpdate = useRoutePermissionGuard(ROUTES.menus, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.menus, 'delete')
  const canApprove = useRoutePermissionGuard(ROUTES.menus, 'approval')

  const params: MenusListParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    sortBy: sorting[0]?.id as MenusSortField | undefined,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  }

  const menusQuery = useMenusQuery(params)
  const deleteMutation = useDeleteMenuMutation()
  const approveMutation = useApproveRequestMutation()
  const rejectMutation = useRejectRequestMutation()

  const columns = useMemo(
    () =>
      createMenuColumns({
        onView: (record) => navigate(ROUTES.menuDetail(record.id)),
        onEdit: (record) => setFormModal({ open: true, menu: record }),
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
        title="Menus"
        description="Manage menus records."
        actions={canCreate ? <Button onClick={() => setFormModal({ open: true, menu: null })}>Add Menu</Button> : null}
      />

      <Card>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search menus..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />

          <Button
            variant="secondary"
            onClick={() => menusQuery.refetch()}
            loading={menusQuery.isFetching && !menusQuery.isLoading}
          >
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={menusQuery.data?.data ?? []}
          getRowId={(record) => record.id}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={menusQuery.isLoading}
          isError={menusQuery.isError}
          errorMessage={menusQuery.error instanceof Error ? menusQuery.error.message : undefined}
          onRetry={() => menusQuery.refetch()}
          emptyTitle="No menus found"
          emptyDescription="Try adjusting your search or filters."
        />

        {menusQuery.data ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={menusQuery.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : null}
      </Card>

      <MenuFormModal
        open={formModal.open}
        menu={formModal.menu}
        onClose={() => setFormModal({ open: false, menu: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete menu"
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
