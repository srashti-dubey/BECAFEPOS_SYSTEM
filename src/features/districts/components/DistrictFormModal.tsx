import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { DynamicFormContainer } from '@/forms/DynamicFormContainer'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { useCreateDistrictMutation, useUpdateDistrictMutation } from '@/features/districts/hooks'
import type { District } from '@/features/districts/types'
import styles from './DistrictFormModal.module.css'

type DistrictFormModalProps = {
  open: boolean
  district?: District | null
  onClose: () => void
}

// Add/Edit fields are fetched from the API at runtime (formId "district-form") and rendered by
// the dynamic form engine — this module has no local opinion on what those fields are. Update
// the backend's form definition to change them, not this file.
export function DistrictFormModal({ open, district, onClose }: DistrictFormModalProps) {
  const isEdit = Boolean(district)
  const createMutation = useCreateDistrictMutation()
  const updateMutation = useUpdateDistrictMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const initialData = district
    ? (Object.fromEntries(Object.entries(district).filter(([key]) => key !== 'id')) as Record<string, unknown>)
    : undefined

  const handleSubmit: DynamicFormSubmitHandler = async (values) => {
    try {
      if (district) {
        await updateMutation.mutateAsync({ id: district.id, ...values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit District' : 'Add District'}>
      {open ? (
        <DynamicFormContainer
          formId="district-form"
          entityId={district?.id}
          initialData={initialData}
          onSubmit={handleSubmit}
        >
          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create district'}
            </Button>
          </div>
        </DynamicFormContainer>
      ) : null}
    </Modal>
  )
}
