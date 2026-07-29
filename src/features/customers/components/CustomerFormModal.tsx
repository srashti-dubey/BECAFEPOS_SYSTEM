import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { Select } from '@/components/shared/Select'
import { FormField } from '@/forms/FormField'
import { FormProvider } from '@/forms/FormProvider'
import { CUSTOMER_STATUS_OPTIONS } from '@/features/customers/constants'
import { useCreateCustomerMutation, useUpdateCustomerMutation, useUpdateLocalCustomerMutation } from '@/features/customers/hooks'
import { useBranchesActiveListQuery } from '@/features/branches/hooks/useBranchesActiveListQuery'
import { parsePendingCustomerId } from '@/features/customers/lib/pendingCustomer'
import { customerFormSchema, type CustomerFormValues } from '@/features/customers/schemas/customerSchema'
import type { Customer } from '@/features/customers/types'
import styles from './CustomerFormModal.module.css'

type CustomerFormModalProps = {
  open: boolean
  customer?: Customer | null
  onClose: () => void
}

const DEFAULT_VALUES: CustomerFormValues = {
  name: '',
  mobile: '',
  email: '',
  remarks: '',
  loyalty_points: '',
  can_notify: '',
  branch_id: '',
  status: 'active',
}

export function CustomerFormModal({ open, customer, onClose }: CustomerFormModalProps) {
  const isEdit = Boolean(customer)
  const createMutation = useCreateCustomerMutation()
  const updateMutation = useUpdateCustomerMutation()
  const updateLocalMutation = useUpdateLocalCustomerMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending || updateLocalMutation.isPending
  const branchesQuery = useBranchesActiveListQuery()
  const branches = branchesQuery.data?.data ?? []

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(
      customer
        ? {
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            remarks: customer.remarks,
            loyalty_points: String(customer.loyalty_points),
            can_notify: customer.can_notify,
            branch_id: customer.branch_id === null ? '' : String(customer.branch_id),
            status: customer.status,
          }
        : DEFAULT_VALUES,
    )
  }, [open, customer, form])

  useEffect(() => {
    // The branch <option> list loads asynchronously, so if it arrives after the reset above,
    // the <select> has no matching option yet and silently drops the customer's branch_id.
    // Re-apply it once the options are available so the correct branch stays selected.
    if (!open || !customer || !branchesQuery.data) {
      return
    }
    form.setValue('branch_id', customer.branch_id === null ? '' : String(customer.branch_id))
  }, [open, customer, branchesQuery.data, form])

  async function handleSubmit(values: CustomerFormValues) {
    // Number fields are validated as strings (see schemas/customerSchema.ts) so the
    // form's field type matches what the DOM input holds; converted to a real number here.
    const payload = {
      ...values,
      loyalty_points: Number(values.loyalty_points),
      // '' means "no branch selected" — send null rather than Number('') (0), which isn't a
      // real branch id and fails the backend's customers_branch_id_fkey constraint.
      branch_id: values.branch_id === '' ? null : Number(values.branch_id),
    }
    // A "pending-N" id is a local-only draft with no server id yet — editing it means editing the
    // queued create op directly. Any other customer (even one with a pending update overlaid on
    // it) has a real server id, so the normal update mutation applies — customerService.update()
    // itself decides whether to PUT to the server or queue the change locally.
    const pendingId = customer ? parsePendingCustomerId(customer.id) : null

    try {
      if (pendingId !== null) {
        await updateLocalMutation.mutateAsync({ pendingId, data: payload })
      } else if (customer) {
        await updateMutation.mutateAsync({ id: customer.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Customer' : 'Add Customer'}>
      <FormProvider form={form} onSubmit={handleSubmit}>
        <FormField<CustomerFormValues> name="name" label="Name" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<CustomerFormValues> name="mobile" label="Mobile" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<CustomerFormValues> name="email" label="Email" required>
          {(field) => <Input type="email" {...field} />}
        </FormField>
        <FormField<CustomerFormValues> name="remarks" label="Remarks" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<CustomerFormValues> name="loyalty_points" label="Loyalty points" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<CustomerFormValues> name="can_notify" label="Can notify" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<CustomerFormValues> name="branch_id" label="Branch">
          {(field) => (
            <Select {...field} disabled={branchesQuery.isLoading}>
              <option value="">{branchesQuery.isLoading ? 'Loading branches...' : 'No branch selected'}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField<CustomerFormValues> name="status" label="Status" required>
          {(field) => (
            <Select {...field}>
              {CUSTOMER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <div className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create customer'}
          </Button>
        </div>
      </FormProvider>
    </Modal>
  )
}
