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
import { CityFormModal } from '@/features/cities/components/CityFormModal'
import { CityStatusBadge } from '@/features/cities/components/CityStatusBadge'
import { useDeleteCityMutation, useCityQuery } from '@/features/cities/hooks'
import styles from './CityViewPage.module.css'

export default function CityViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const cityQuery = useCityQuery(id)
  const deleteMutation = useDeleteCityMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.cities, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.cities, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (cityQuery.isLoading) {
    return <Loader fullHeight label="Loading city..." />
  }

  if (cityQuery.isError || !cityQuery.data) {
    return (
      <ErrorState title="City not found" description="This city may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.cities)}>Back to cities</Button>
      </ErrorState>
    )
  }

  const city = cityQuery.data

  async function handleDelete() {
    await deleteMutation.mutateAsync(city.id)
    navigate(ROUTES.cities, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={String(city.name)}
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
              {city.name}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Status</dt>
            <dd className={styles.value}>
              <CityStatusBadge status={city.status} />
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{new Date(city.created_at).toLocaleString()}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{new Date(city.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      <CityFormModal open={isEditOpen} city={city} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete city"
        message={`Are you sure you want to delete ${city.name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
