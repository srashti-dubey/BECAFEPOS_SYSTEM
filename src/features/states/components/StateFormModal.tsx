import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { DynamicFormContainer } from '@/forms/DynamicFormContainer'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { useCreateStateMutation, useUpdateStateMutation } from '@/features/states/hooks'
import type { State } from '@/features/states/types'
import styles from './StateFormModal.module.css'

type StateFormModalProps = {
  open: boolean
  state?: State | null
  onClose: () => void
}

// Add/Edit fields are fetched from the API at runtime (formId "state-form") and rendered by
// the dynamic form engine — this module has no local opinion on what those fields are. Update
// the backend's form definition to change them, not this file.
export function StateFormModal({ open, state, onClose }: StateFormModalProps) {
  const isEdit = Boolean(state)
  const createMutation = useCreateStateMutation()
  const updateMutation = useUpdateStateMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const initialData = state
    ? (Object.fromEntries(Object.entries(state).filter(([key]) => key !== 'id')) as Record<string, unknown>)
    : undefined

  const handleSubmit: DynamicFormSubmitHandler = async (values) => {
    try {
      if (state) {
        await updateMutation.mutateAsync({ id: state.id, ...values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit State' : 'Add State'}>
      {open ? (
        <DynamicFormContainer
          formId="state-form"
          entityId={state?.id}
          initialData={initialData}
          onSubmit={handleSubmit}
        >
          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create state'}
            </Button>
          </div>
        </DynamicFormContainer>
      ) : null}
    </Modal>
  )
}
