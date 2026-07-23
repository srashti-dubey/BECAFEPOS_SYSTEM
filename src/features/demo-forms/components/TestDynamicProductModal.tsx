import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { DynamicFormContainer } from '@/forms/DynamicFormContainer'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { useCreateProductMutation, useUpdateProductMutation } from '@/features/products/hooks'
import type { Product } from '@/features/products/types'

type TestDynamicProductModalProps = {
  open: boolean
  product?: Product | null
  onClose: () => void
}

export function TestDynamicProductModal({ open, product, onClose }: TestDynamicProductModalProps) {
  const isEdit = Boolean(product)
  const createMutation = useCreateProductMutation()
  const updateMutation = useUpdateProductMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const initialData = product
    ? (Object.fromEntries(Object.entries(product).filter(([key]) => key !== 'id')) as Record<string, unknown>)
    : undefined

  const handleSubmit: DynamicFormSubmitHandler = async (values, context) => {
    const payload = {
      id: product?.id,
      formId: context.formId,
      values,
    }

    if (product) {
      await updateMutation.mutateAsync(payload)
    } else {
      await createMutation.mutateAsync(payload)
    }

    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'}>
      {open ? (
        <DynamicFormContainer
          formId="product-form"
          entityId={product?.id}
          initialData={initialData}
          onSubmit={handleSubmit}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </DynamicFormContainer>
      ) : null}
    </Modal>
  )
}
