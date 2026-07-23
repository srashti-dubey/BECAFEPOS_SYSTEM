import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { Select } from '@/components/shared/Select'
import { FormField } from '@/forms/FormField'
import { FormProvider } from '@/forms/FormProvider'
import { BranchTreeSelect } from '@/features/branches/components/BranchTreeSelect'
import { useBranchesTreeQuery } from '@/features/branches/hooks'
import { useRolesQuery } from '@/features/roles/hooks'
import { USER_STATUS_OPTIONS } from '@/features/users/constants'
import { useCreateUserMutation, useUpdateUserMutation } from '@/features/users/hooks'
import { userEditFormSchema, userFormSchema, type UserFormValues } from '@/features/users/schemas/userSchema'
import type { User } from '@/features/users/types'
import styles from './UserFormModal.module.css'

type UserFormModalProps = {
  open: boolean
  user?: User | null
  onClose: () => void
}

const DEFAULT_VALUES: UserFormValues = {
  name: '',
  email: '',
  password: '',
  mobile: '',
  role_id: '',
  status: 'active',
  branch_ids: [],
}

export function UserFormModal({ open, user, onClose }: UserFormModalProps) {
  const isEdit = Boolean(user)
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const rolesQuery = useRolesQuery({ page: 1, pageSize: 1000 })
  const activeRoleOptions = rolesQuery.data?.data ?? [];
  const branchesTreeQuery = useBranchesTreeQuery({ active_only: true })
  const branchTree = branchesTreeQuery.data ?? []

  // Password is only collected when adding a user, so editing skips its validation.
  const resolver = useMemo(
    () => zodResolver((isEdit ? userEditFormSchema : userFormSchema) as typeof userFormSchema),
    [isEdit],
  )

  const form = useForm<UserFormValues>({
    resolver,
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(
      user
        ? {
            name: user.name,
            email: user.email,
            mobile: user.mobile ?? '',
            role_id: String(user.role_id ?? user.role_name ?? ''),
            status: user.status,
            branch_ids: user.branch_ids ?? [],
          }
        : DEFAULT_VALUES,
    )
  }, [open, user, form])

  async function handleSubmit(values: UserFormValues) {
    try {
      if (user) {
        await updateMutation.mutateAsync({
          id: user.id,
          name: values.name,
          email: values.email,
          mobile: values.mobile,
          role_id: Number(values.role_id),
          status: values.status,
          branch_ids: values.branch_ids,
        })
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          mobile: values.mobile,
          role_id: Number(values.role_id),
          status: values.status,
          branch_ids: values.branch_ids,
        })
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Add User'}>
      <FormProvider form={form} onSubmit={handleSubmit}>
        <FormField<UserFormValues> name="name" label="Full name" required>
          {(field) => <Input placeholder="Jane Doe" {...field} />}
        </FormField>

        <FormField<UserFormValues> name="email" label="Email" required>
          {(field) => <Input type="email" placeholder="jane@example.com" {...field} />}
        </FormField>
        {!isEdit && (
          <FormField<UserFormValues> name="password" label="Password" required>
            {(field) => (
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Enter Password"
                {...field}
              />
            )}
          </FormField>
        )}

        <FormField<UserFormValues> name="mobile" label="Mobile" required>
          {(field) => <Input placeholder="Enter mobile number" {...field} />}
        </FormField>

        <FormField<UserFormValues> name="role_id" label="Role" required>
          {(field) => (
            <Select {...field}>
              <option value="" disabled>
                {rolesQuery.isLoading ? 'Loading roles...' : 'Select a role'}
              </option>
              {activeRoleOptions.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <div className={styles.branchField}>
          <span className={styles.branchLabel}>Branches</span>
          <Controller
            control={form.control}
            name="branch_ids"
            render={({ field }) => (
              <BranchTreeSelect
                tree={branchTree}
                value={field.value ?? []}
                onChange={field.onChange}
                isLoading={branchesTreeQuery.isLoading}
              />
            )}
          />
        </div>

        <FormField<UserFormValues> name="status" label="Status" required>
          {(field) => (
            <Select {...field}>
              {USER_STATUS_OPTIONS.map((option) => (
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
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </div>
      </FormProvider>
    </Modal>
  )
}
