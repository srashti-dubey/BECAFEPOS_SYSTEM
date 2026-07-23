import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { DynamicFormContainer } from '@/forms/DynamicFormContainer'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { useCreateBranchMutation, useUpdateBranchMutation } from '@/features/branches/hooks'
import type { Branch } from '@/features/branches/types'
import styles from './BranchFormModal.module.css'

type BranchFormModalProps = {
  open: boolean
  branch?: Branch | null
  onClose: () => void
}

// Add/Edit fields are fetched from the API at runtime (formId "branch-form") and rendered by
// the dynamic form engine — this module has no local opinion on what those fields are. Update
// the backend's form definition to change them, not this file.
export function BranchFormModal({ open, branch, onClose }: BranchFormModalProps) {
  const isEdit = Boolean(branch)
  const createMutation = useCreateBranchMutation()
  const updateMutation = useUpdateBranchMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const initialData = branch
    ? (Object.fromEntries(Object.entries(branch).filter(([key]) => key !== 'id')) as Record<string, unknown>)
    : undefined

  const handleSubmit: DynamicFormSubmitHandler = async (values) => {
    try {
      if (branch) {
        await updateMutation.mutateAsync({ id: branch.id, ...values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Branch' : 'Add Branch'}>
      {open ? (
        <DynamicFormContainer
          formId="branch-form"
          entityId={branch?.id}
          initialData={initialData}
          onSubmit={handleSubmit}
        >
          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create branch'}
            </Button>
          </div>
        </DynamicFormContainer>
      ) : null}
    </Modal>
  )
}
