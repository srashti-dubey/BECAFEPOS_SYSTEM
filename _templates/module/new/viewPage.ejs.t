---
to: src/features/<%= folder %>/pages/<%= singular %>ViewPage.tsx
---
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
import { <%= singular %>FormModal } from '@/features/<%= folder %>/components/<%= singular %>FormModal'
<%_ if (hasStatusField) { _%>
import { <%= singular %>StatusBadge } from '@/features/<%= folder %>/components/<%= singular %>StatusBadge'
<%_ } _%>
<%_ if (enumFields.some(function(f) { return f.name !== 'status' })) { _%>
import { <%= enumFields.filter(function(f) { return f.name !== 'status' }).map(function(f) { return 'get' + singular + f.pascal + 'Label' }).join(', ') %> } from '@/features/<%= folder %>/constants'
<%_ } _%>
import { useDelete<%= singular %>Mutation, use<%= singular %>Query } from '@/features/<%= folder %>/hooks'
import styles from './<%= singular %>ViewPage.module.css'

export default function <%= singular %>ViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const <%= singularCamel %>Query = use<%= singular %>Query(id)
  const deleteMutation = useDelete<%= singular %>Mutation()
  const canUpdate = useRoutePermissionGuard(ROUTES.<%= pluralCamel %>, 'edit')
  const canDelete = useRoutePermissionGuard(ROUTES.<%= pluralCamel %>, 'delete')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (<%= singularCamel %>Query.isLoading) {
    return <Loader fullHeight label="Loading <%= singularCamel %>..." />
  }

  if (<%= singularCamel %>Query.isError || !<%= singularCamel %>Query.data) {
    return (
      <ErrorState title="<%= singular %> not found" description="This <%= singularCamel %> may have been deleted or the link is invalid.">
        <Button onClick={() => navigate(ROUTES.<%= pluralCamel %>)}>Back to <%= pluralCamel %></Button>
      </ErrorState>
    )
  }

  const <%= singularCamel %> = <%= singularCamel %>Query.data

  async function handleDelete() {
    await deleteMutation.mutateAsync(<%= singularCamel %>.id)
    navigate(ROUTES.<%= pluralCamel %>, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={String(<%= singularCamel %>.<%= displayField %>)}
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
<%_ fields.forEach(function(field) { _%>
          <div className={styles.field}>
            <dt className={styles.label}><%= field.label %></dt>
            <dd className={styles.value}>
<%_ if (field.name === 'status' && field.type === 'enum') { _%>
              <<%= singular %>StatusBadge status={<%= singularCamel %>.status} />
<%_ } else if (field.type === 'enum') { _%>
              {get<%= singular %><%= field.pascal %>Label(<%= singularCamel %>.<%= field.name %>)}
<%_ } else if (field.type === 'boolean') { _%>
              {<%= singularCamel %>.<%= field.name %> ? 'Yes' : 'No'}
<%_ } else if (field.type === 'date') { _%>
              {new Date(<%= singularCamel %>.<%= field.name %>).toLocaleDateString()}
<%_ } else { _%>
              {<%= singularCamel %>.<%= field.name %>}
<%_ } _%>
            </dd>
          </div>
<%_ }) _%>
          <div className={styles.field}>
            <dt className={styles.label}>Created</dt>
            <dd className={styles.value}>{new Date(<%= singularCamel %>.created_at).toLocaleString()}</dd>
          </div>
          <div className={styles.field}>
            <dt className={styles.label}>Last updated</dt>
            <dd className={styles.value}>{new Date(<%= singularCamel %>.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      <<%= singular %>FormModal open={isEditOpen} <%= singularCamel %>={<%= singularCamel %>} onClose={() => setIsEditOpen(false)} />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete <%= singularCamel %>"
        message={`Are you sure you want to delete ${<%= singularCamel %>.<%= displayField %>}? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
