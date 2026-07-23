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
import { DistrictFormModal } from '@/features/districts/components/DistrictFormModal'
import { DistrictStatusBadge } from '@/features/districts/components/DistrictStatusBadge'
import { useDeleteDistrictMutation, useDistrictQuery } from '@/features/districts/hooks'
import styles from './DistrictViewPage.module.css'

export default function DistrictViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const districtQuery = useDistrictQuery(id)
  const deleteMutation = useDeleteDistrictMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.districts, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.districts, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (districtQuery.isLoading) {
    return <Loader fullHeight label="Loading district..." />
  }

  if (districtQuery.isError || !districtQuery.data) {
    return (
      <ErrorState title="District not found" description="This district may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.districts)}>Back to districts</Button>
      </ErrorState>
    )
  }

  const district = districtQuery.data

  async function handleDelete() {
    await deleteMutation.mutateAsync(district.id)
    navigate(ROUTES.districts, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={String(district.district_name)}
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
              {district.district_name}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Status</dt>
            <dd className={styles.value}>
              <DistrictStatusBadge status={district.status} />
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{new Date(district.created_at).toLocaleString()}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{new Date(district.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      <DistrictFormModal open={isEditOpen} district={district} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete district"
        message={`Are you sure you want to delete ${district.district_name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
