import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRoutePermissionGuard } from '@/auth/hooks'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState'
import { Loader } from '@/components/shared/Loader'
import { PageHeader } from '@/components/shared/PageHeader'
import { ROUTES } from '@/constants/routes'
import { MenuFormModal } from '@/features/menus/components/MenuFormModal'
import { useDeleteMenuMutation, useMenuQuery } from '@/features/menus/hooks'
import styles from './MenuViewPage.module.css'

export default function MenuViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const menuQuery = useMenuQuery(id)
  const deleteMutation = useDeleteMenuMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.menus, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.menus, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (menuQuery.isLoading) {
    return <Loader fullHeight label="Loading menu..." />
  }

  if (menuQuery.isError || !menuQuery.data) {
    return (
      <ErrorState title="Menu not found" description="This menu may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.menus)}>Back to menus</Button>
      </ErrorState>
    )
  }

  const menu = menuQuery.data
  
  async function handleDelete() {
    await deleteMutation.mutateAsync(menu.id)
    navigate(ROUTES.menus, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={String(menu.name)}
        actions={
          <>
            {canUpdate ? (
              <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
                Edit
              </Button>
            ) : null}
            {canDelete ? (
              <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
                Delete
              </Button>
            ) : null}
          </>
        }
      />

      <Card>
        <dl className={styles.grid}>
          <div className={styles.field}>
            <dt className={styles.label}>Name</dt>
            <dd className={styles.value}>
              {menu.name}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Route</dt>
            <dd className={styles.value}>
              {menu.route}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Parent menu</dt>
            <dd className={styles.value}>
              {menu.parent_id ? menu.parent_id.name : 'None'}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Sort order</dt>
            <dd className={styles.value}>
              {menu.sort_order}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Is active</dt>
            <dd className={styles.value}>
              {menu.is_active ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{menu.created_at ? new Date(menu.created_at).toLocaleString() : 'N/A'}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{menu.updated_at ? new Date(menu.updated_at).toLocaleString() : 'N/A'}</dd>
          </div>
        </dl>
      </Card>

      <MenuFormModal open={isEditOpen} menu={menu} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete menu"
        message={`Are you sure you want to delete ${menu.name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
