import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/shared/Button'
import { Checkbox } from '@/components/shared/Checkbox'
import { Input } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { FormField } from '@/forms/FormField'
import { FormProvider } from '@/forms/FormProvider'
import { useCreateRoleMutation, useUpdateRoleMutation } from '@/features/roles/hooks'
import { roleFormSchema, type RoleFormValues } from '@/features/roles/schemas/roleSchema'
import type { Role } from '@/features/roles/types'
import styles from './RoleFormModal.module.css'

type RoleFormModalProps = {
  open: boolean
  role?: Role | null
  onClose: () => void
}

const DEFAULT_VALUES: RoleFormValues = {
  name: '',
  description: '',
  is_active: false,
}

export function RoleFormModal({ open, role, onClose }: RoleFormModalProps) {
  const isEdit = Boolean(role)
  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(
      role
        ? {
            name: role.name,
            description: role.description,
            is_active: role.is_active,
          }
        : DEFAULT_VALUES,
    )
  }, [open, role, form])

  async function handleSubmit(values: RoleFormValues) {
    try {
      if (role) {
        await updateMutation.mutateAsync({ id: role.id, ...values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Role' : 'Add Role'}>
      <FormProvider form={form} onSubmit={handleSubmit}>
        <FormField<RoleFormValues> name="name" label="Name" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<RoleFormValues> name="description" label="Description" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<RoleFormValues> name="is_active" label="Is active" required>
          {(field) => <Checkbox label="Is active" {...field} />}
        </FormField>

        <div className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create role'}
          </Button>
        </div>
      </FormProvider>
    </Modal>
  )
}
