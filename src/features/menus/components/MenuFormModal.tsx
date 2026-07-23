import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/shared/Button'
import { Checkbox } from '@/components/shared/Checkbox'
import { Input } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { Select } from '@/components/shared/Select'
import { FormField } from '@/forms/FormField'
import { FormProvider } from '@/forms/FormProvider'
import { useCreateMenuMutation, useUpdateMenuMutation, useMenusTreeQuery } from '@/features/menus/hooks'
import { menuFormSchema, type MenuFormValues } from '@/features/menus/schemas/menuSchema'
import type { Menu, MenuTreeItem } from '@/features/menus/types'
import styles from './MenuFormModal.module.css'

type MenuFormModalProps = {
  open: boolean
  menu?: Menu | null
  onClose: () => void
}

const DEFAULT_VALUES: MenuFormValues = {
  name: '',
  route: '',
  parent_id: '',
  sort_order: '',
  is_active: false,
}

function flattenParentOptions(
  items: MenuTreeItem[],
  currentMenuId?: string,
  depth = 0,
): Array<{ value: string; label: string }> {
  return items.flatMap((item) => {
    if (item.id === currentMenuId) {
      return []
    }

    const options = [{ value: String(item.id), label: `${' '.repeat(depth * 2)}${item.name}` }]

    if (item.children?.length) {
      return [...options, ...flattenParentOptions(item.children, currentMenuId, depth + 1)]
    }

    return options
  })
}

export function MenuFormModal({ open, menu, onClose }: MenuFormModalProps) {
  const isEdit = Boolean(menu)
  const createMutation = useCreateMenuMutation()
  const updateMutation = useUpdateMenuMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const { data: parentMenus = [], isLoading: isLoadingParents } = useMenusTreeQuery({ active_only: true })

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const selectedParentValue = String(form.watch('parent_id') ?? '')
  const parentOptions = flattenParentOptions(parentMenus, menu?.id)

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(
      menu
        ? {
            name: menu.name,
            route: menu.route,
            parent_id: String(menu.parent_id?.id ?? ''),
            sort_order: String(menu.sort_order),
            is_active: menu.is_active,
          }
        : DEFAULT_VALUES,
    )
  }, [open, menu, form])

  async function handleSubmit(values: MenuFormValues) {
    const payload = {
      ...values,
      parent_id: values.parent_id ? Number(values.parent_id) : null,
      sort_order: Number(values.sort_order),
    }

    try {
      if (menu) {
        await updateMutation.mutateAsync({ id: menu.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Menu' : 'Add Menu'}>
      <FormProvider form={form} onSubmit={handleSubmit}>
        <FormField<MenuFormValues> name="name" label="Name" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<MenuFormValues> name="route" label="Route" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<MenuFormValues> name="parent_id" label="Parent menu" required>
          {(field) => (
            <Select {...field}>
              <option value="" disabled>
                {isLoadingParents ? 'Loading parent menus...' : 'Select parent menu'}
              </option>
              {parentOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  selected={option.value === selectedParentValue}
                  disabled={isEdit && Boolean(selectedParentValue) && String(option.value) !== String(selectedParentValue)}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField<MenuFormValues> name="sort_order" label="Sort order" required>
          {(field) => <Input type="text" {...field} />}
        </FormField>
        <FormField<MenuFormValues> name="is_active" label="Is active" required>
          {(field) => <Checkbox label="Is active" {...field} />}
        </FormField>

        <div className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create menu'}
          </Button>
        </div>
      </FormProvider>
    </Modal>
  )
}
