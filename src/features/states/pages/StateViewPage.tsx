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
import { StateFormModal } from '@/features/states/components/StateFormModal'
import { StateStatusBadge } from '@/features/states/components/StateStatusBadge'
import { useDeleteStateMutation, useStateQuery } from '@/features/states/hooks'
import styles from './StateViewPage.module.css'

export default function StateViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stateQuery = useStateQuery(id)
  const deleteMutation = useDeleteStateMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.states, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.states, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (stateQuery.isLoading) {
    return <Loader fullHeight label="Loading state..." />
  }

  if (stateQuery.isError || !stateQuery.data) {
    return (
      <ErrorState title="State not found" description="This state may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.states)}>Back to states</Button>
      </ErrorState>
    )
  }

  const state = stateQuery.data

  async function handleDelete() {
    await deleteMutation.mutateAsync(state.id)
    navigate(ROUTES.states, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={String(state.state_name)}
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
              {state.state_name}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Status</dt>
            <dd className={styles.value}>
              <StateStatusBadge status={state.status} />
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{new Date(state.created_at).toLocaleString()}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{new Date(state.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      <StateFormModal open={isEditOpen} state={state} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete state"
        message={`Are you sure you want to delete ${state.state_name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
