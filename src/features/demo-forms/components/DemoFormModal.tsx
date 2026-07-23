import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { DynamicFormContainer } from '@/forms/DynamicFormContainer'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { useSubmitDynamicFormMutation } from '@/features/demo-forms/hooks'

type DemoFormModalProps = {
  open: boolean
  formId: string
  title: string
  submission?: (Record<string, unknown> & { id: string }) | null
  onClose: () => void
}

export function DemoFormModal({ open, formId, title, submission, onClose }: DemoFormModalProps) {
  const isEdit = Boolean(submission)
  const submitMutation = useSubmitDynamicFormMutation(formId)

  const initialData = submission
    ? (Object.fromEntries(Object.entries(submission).filter(([key]) => key !== 'id')) as Record<string, unknown>)
    : undefined

  const handleSubmit: DynamicFormSubmitHandler = async (values, context) => {
    await submitMutation.mutateAsync({
      id: submission?.id,
      formId: context.formId,
      values,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Edit ${title}` : title}>
      {open ? (
        <DynamicFormContainer formId={formId} entityId={submission?.id} initialData={initialData} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={submitMutation.isPending}>
              {isEdit ? 'Save changes' : 'Submit'}
            </Button>
          </div>
        </DynamicFormContainer>
      ) : null}
    </Modal>
  )
}
