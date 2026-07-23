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
import { BranchFormModal } from '@/features/branches/components/BranchFormModal'
import { BranchStatusBadge } from '@/features/branches/components/BranchStatusBadge'
import { useDeleteBranchMutation, useBranchQuery } from '@/features/branches/hooks'
import styles from './BranchViewPage.module.css'

export default function BranchViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const branchQuery = useBranchQuery(id)
  const deleteMutation = useDeleteBranchMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.branches, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.branches, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (branchQuery.isLoading) {
    return <Loader fullHeight label="Loading branch..." />
  }

  if (branchQuery.isError || !branchQuery.data) {
    return (
      <ErrorState title="Branch not found" description="This branch may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.branches)}>Back to branches</Button>
      </ErrorState>
    )
  }

  const branch = branchQuery.data

  async function handleDelete() {
    await deleteMutation.mutateAsync(branch.id)
    navigate(ROUTES.branches, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={branch.branch_name}
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
            <dt className={styles.label}>Branch name</dt>
            <dd className={styles.value}>
              {branch.branch_name}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Branch code</dt>
            <dd className={styles.value}>
              {branch.branch_code}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Address</dt>
            <dd className={styles.value}>
              {branch.address}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Status</dt>
            <dd className={styles.value}>
              <BranchStatusBadge status={branch.status} />
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{branch.created_at ? new Date(branch.created_at).toLocaleString() : 'N/A'}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{branch.updated_at ? new Date(branch.updated_at).toLocaleString() : 'N/A'}</dd>
          </div>
        </dl>
      </Card>

      <BranchFormModal open={isEditOpen} branch={branch} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete branch"
        message={`Are you sure you want to delete ${branch.branch_name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
