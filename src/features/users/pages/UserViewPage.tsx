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
import { UserFormModal } from '@/features/users/components/UserFormModal'
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge'
import { useDeleteUserMutation, useUserQuery } from '@/features/users/hooks'
import styles from './UserViewPage.module.css'

export default function UserViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userQuery = useUserQuery(id)
  const deleteMutation = useDeleteUserMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.users, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.users, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (userQuery.isLoading) {
    return <Loader fullHeight label="Loading user..." />
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <ErrorState title="User not found" description="This user may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.users)}>Back to users</Button>
      </ErrorState>
    )
  }

  const user = userQuery?.data
  
  async function handleDelete() {
    await deleteMutation.mutateAsync(user.id)
    navigate(ROUTES.users, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={user.name}
        description={user.email}
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
            <dd className={styles.value}>{user.name}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Email</dt>
            <dd className={styles.value}>{user.email}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Phone</dt>
            <dd className={styles.value}>{user?.mobile || 'N/A'}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Role</dt>
            <dd className={styles.value}>{user.role_name ?? '—'}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Status</dt>
            <dd className={styles.value}>
              <UserStatusBadge status={user.status} />
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{user.created_at ? new Date(user.created_at).toLocaleString() : '—'}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{user.updated_at ? new Date(user.updated_at).toLocaleString() : '—'}</dd>
          </div>
        </dl>
      </Card>

      <UserFormModal open={isEditOpen} user={user} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete user"
        message={`Are you sure you want to delete ${user.name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
