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
import { CustomerFormModal } from '@/features/customers/components/CustomerFormModal'
import { CustomerStatusBadge } from '@/features/customers/components/CustomerStatusBadge'
import { useDeleteCustomerMutation, useCustomerQuery } from '@/features/customers/hooks'
import styles from './CustomerViewPage.module.css'

export default function CustomerViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerQuery = useCustomerQuery(id)
  const deleteMutation = useDeleteCustomerMutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.customers, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.customers, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (customerQuery.isLoading) {
    return <Loader fullHeight label="Loading customer..." />
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <ErrorState title="Customer not found" description="This customer may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.customers)}>Back to customers</Button>
      </ErrorState>
    )
  }

  const customer = customerQuery.data

  async function handleDelete() {
    await deleteMutation.mutateAsync(customer.id)
    navigate(ROUTES.customers, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={String(customer.name)}
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
              {customer.name}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Mobile</dt>
            <dd className={styles.value}>
              {customer.mobile}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Email</dt>
            <dd className={styles.value}>
              {customer.email}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Remarks</dt>
            <dd className={styles.value}>
              {customer.remarks}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Loyalty points</dt>
            <dd className={styles.value}>
              {customer.loyalty_points}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Can notify</dt>
            <dd className={styles.value}>
              {customer.can_notify}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Branch id</dt>
            <dd className={styles.value}>
              {customer.branch_id}
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Status</dt>
            <dd className={styles.value}>
              <CustomerStatusBadge status={customer.status} />
            </dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{new Date(customer.created_at).toLocaleString()}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{new Date(customer.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      <CustomerFormModal open={isEditOpen} customer={customer} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete customer"
        message={`Are you sure you want to delete ${customer.name}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
