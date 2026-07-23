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
import { RoleFormModal } from '@/features/roles/components/RoleFormModal'
import { useDeleteRoleMutation, useRoleQuery } from '@/features/roles/hooks'
import styles from './RoleViewPage.module.css'

export default function RoleViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const roleQuery = useRoleQuery(id)
  const deleteMutation = useDeleteRoleMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.roles, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.roles, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (roleQuery.isLoading) {
    return <Loader fullHeight label="Loading role..." />
  }

  if (roleQuery.isError || !roleQuery.data) {
    return (
      <ErrorState title="Role not found" description="This role may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.roles)}>Back to roles</Button>
      </ErrorState>
    )
  }

  const role = roleQuery.data

  async function handleDelete() {
    await deleteMutation.mutateAsync(role.id)
    navigate(ROUTES.roles, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={String(role.name)}
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
              {role.name}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Description</dt>
            <dd className={styles.value}>
              {role.description}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Is active</dt>
            <dd className={styles.value}>
              {role.is_active ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{role.created_at ? new Date(role.created_at).toLocaleString() : 'N/A'}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{role.updated_at ? new Date(role.updated_at).toLocaleString() : 'N/A'}</dd>
          </div>
        </dl>
      </Card>

      <RoleFormModal open={isEditOpen} role={role} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete role"
        message={`Are you sure you want to delete ${role.name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
