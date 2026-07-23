import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { DynamicFormContainer } from '@/forms/DynamicFormContainer'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { useCreateCityMutation, useUpdateCityMutation } from '@/features/cities/hooks'
import type { City } from '@/features/cities/types'
import styles from './CityFormModal.module.css'

type CityFormModalProps = {
  open: boolean
  city?: City | null
  onClose: () => void
}

// Add/Edit fields are fetched from the API at runtime (formId "city-form") and rendered by
// the dynamic form engine — this module has no local opinion on what those fields are. Update
// the backend's form definition to change them, not this file.
export function CityFormModal({ open, city, onClose }: CityFormModalProps) {
  const isEdit = Boolean(city)
  const createMutation = useCreateCityMutation()
  const updateMutation = useUpdateCityMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const initialData = city
    ? (Object.fromEntries(Object.entries(city).filter(([key]) => key !== 'id')) as Record<string, unknown>)
    : undefined

  const handleSubmit: DynamicFormSubmitHandler = async (values) => {
    try {
      if (city) {
        await updateMutation.mutateAsync({ id: city.id, ...values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit City' : 'Add City'}>
      {open ? (
        <DynamicFormContainer
          formId="city-form"
          entityId={city?.id}
          initialData={initialData}
          onSubmit={handleSubmit}
        >
          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create city'}
            </Button>
          </div>
        </DynamicFormContainer>
      ) : null}
    </Modal>
  )
}
