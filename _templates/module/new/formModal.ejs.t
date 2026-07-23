---
to: src/features/<%= folder %>/components/<%= singular %>FormModal.tsx
---
<%_ if (isDynamicForm) { _%>
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { DynamicFormContainer } from '@/forms/DynamicFormContainer'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { useCreate<%= singular %>Mutation, useUpdate<%= singular %>Mutation } from '@/features/<%= folder %>/hooks'
import type { <%= singular %> } from '@/features/<%= folder %>/types'
import styles from './<%= singular %>FormModal.module.css'

type <%= singular %>FormModalProps = {
  open: boolean
  <%= singularCamel %>?: <%= singular %> | null
  onClose: () => void
}

// Add/Edit fields are fetched from the API at runtime (formId "<%= formId %>") and rendered by
// the dynamic form engine — this module has no local opinion on what those fields are. Update
// the backend's form definition to change them, not this file.
export function <%= singular %>FormModal({ open, <%= singularCamel %>, onClose }: <%= singular %>FormModalProps) {
  const isEdit = Boolean(<%= singularCamel %>)
  const createMutation = useCreate<%= singular %>Mutation()
  const updateMutation = useUpdate<%= singular %>Mutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const initialData = <%= singularCamel %>
    ? (Object.fromEntries(Object.entries(<%= singularCamel %>).filter(([key]) => key !== 'id')) as Record<string, unknown>)
    : undefined

  const handleSubmit: DynamicFormSubmitHandler = async (values) => {
    try {
      if (<%= singularCamel %>) {
        await updateMutation.mutateAsync({ id: <%= singularCamel %>.id, ...values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit <%= singular %>' : 'Add <%= singular %>'}>
      {open ? (
        <DynamicFormContainer
          formId="<%= formId %>"
          entityId={<%= singularCamel %>?.id}
          initialData={initialData}
          onSubmit={handleSubmit}
        >
          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create <%= singularCamel %>'}
            </Button>
          </div>
        </DynamicFormContainer>
      ) : null}
    </Modal>
  )
}
<%_ } else { _%>
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/shared/Button'
<%_ if (hasBooleanFields) { _%>
import { Checkbox } from '@/components/shared/Checkbox'
<%_ } _%>
<%_ if (hasPlainInputFields) { _%>
import { Input } from '@/components/shared/Input'
<%_ } _%>
import { Modal } from '@/components/shared/Modal'
<%_ if (hasEnumFields) { _%>
import { Select } from '@/components/shared/Select'
<%_ } _%>
import { FormField } from '@/forms/FormField'
import { FormProvider } from '@/forms/FormProvider'
<%_ if (hasEnumFields) { _%>
import { <%= enumFields.map(function(f) { return f.optionsConstName }).join(', ') %> } from '@/features/<%= folder %>/constants'
<%_ } _%>
import { useCreate<%= singular %>Mutation, useUpdate<%= singular %>Mutation } from '@/features/<%= folder %>/hooks'
import { <%= singularCamel %>FormSchema, type <%= singular %>FormValues } from '@/features/<%= folder %>/schemas/<%= singularCamel %>Schema'
import type { <%= singular %> } from '@/features/<%= folder %>/types'
import styles from './<%= singular %>FormModal.module.css'

type <%= singular %>FormModalProps = {
  open: boolean
  <%= singularCamel %>?: <%= singular %> | null
  onClose: () => void
}

const DEFAULT_VALUES: <%= singular %>FormValues = {
<%_ fields.forEach(function(field) { _%>
  <%= field.name %>: <%- field.defaultValue %>,
<%_ }) _%>
}

export function <%= singular %>FormModal({ open, <%= singularCamel %>, onClose }: <%= singular %>FormModalProps) {
  const isEdit = Boolean(<%= singularCamel %>)
  const createMutation = useCreate<%= singular %>Mutation()
  const updateMutation = useUpdate<%= singular %>Mutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<<%= singular %>FormValues>({
    resolver: zodResolver(<%= singularCamel %>FormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(
      <%= singularCamel %>
        ? {
<%_ fields.forEach(function(field) { _%>
<%_ if (field.type === 'number') { _%>
            <%= field.name %>: String(<%= singularCamel %>.<%= field.name %>),
<%_ } else { _%>
            <%= field.name %>: <%= singularCamel %>.<%= field.name %>,
<%_ } _%>
<%_ }) _%>
          }
        : DEFAULT_VALUES,
    )
  }, [open, <%= singularCamel %>, form])

  async function handleSubmit(values: <%= singular %>FormValues) {
<%_ if (hasNumberFields) { _%>
    // Number fields are validated as strings (see schemas/<%= singularCamel %>Schema.ts) so the
    // form's field type matches what the DOM input holds; converted to a real number here.
    const payload = {
      ...values,
<%_ numberFields.forEach(function(field) { _%>
      <%= field.name %>: Number(values.<%= field.name %>),
<%_ }) _%>
    }
<%_ } _%>
    try {
      if (<%= singularCamel %>) {
        await updateMutation.mutateAsync({ id: <%= singularCamel %>.id, ...<%= hasNumberFields ? 'payload' : 'values' %> })
      } else {
        await createMutation.mutateAsync(<%= hasNumberFields ? 'payload' : 'values' %>)
      }
      onClose()
    } catch {
      // Failure is already surfaced via the mutation's onError toast; keep the modal open to correct.
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit <%= singular %>' : 'Add <%= singular %>'}>
      <FormProvider form={form} onSubmit={handleSubmit}>
<%_ fields.forEach(function(field) { _%>
        <FormField<<%= singular %>FormValues> name="<%= field.name %>" label="<%= field.label %>"<%= field.required ? ' required' : '' %>>
<%_ if (field.control === 'select') { _%>
          {(field) => (
            <Select {...field}>
              {<%= field.optionsConstName %>.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
<%_ } else if (field.control === 'checkbox') { _%>
          {(field) => <Checkbox label="<%= field.label %>" {...field} />}
<%_ } else { _%>
          {(field) => <Input type="<%= field.inputType %>" {...field} />}
<%_ } _%>
        </FormField>
<%_ }) _%>

        <div className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create <%= singularCamel %>'}
          </Button>
        </div>
      </FormProvider>
    </Modal>
  )
}
<%_ } _%>
