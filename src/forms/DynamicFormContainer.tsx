import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/shared/Card'
import { Spinner } from '@/components/shared/Spinner'
import { DynamicForm } from '@/forms/DynamicForm'
import type { DynamicFormSubmitHandler } from '@/forms/DynamicForm'
import { fetchFormSchema } from '@/services/formService'
import styles from './DynamicForm.module.css'

type DynamicFormContainerProps = {
  formId: string
  entityId?: string
  initialData?: Record<string, unknown> | null
  children?: React.ReactNode
  onSubmit?: DynamicFormSubmitHandler
}

export function DynamicFormContainer({ formId, entityId, initialData, children, onSubmit }: DynamicFormContainerProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dynamic-form', formId, entityId],
    queryFn: () => fetchFormSchema(formId, entityId),
    enabled: Boolean(formId),
  })

  if (isLoading) {
    return (
      <Card className={styles.form}>
        <div className={styles.actions}>
          <Spinner size="md" />
          <span>Loading form…</span>
        </div>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className={styles.form}>
        <p>Unable to load this form right now.</p>
        <p>{error instanceof Error ? error.message : 'Please try again.'}</p>
      </Card>
    )
  }

  return (
    <DynamicForm schema={data} initialData={initialData} onSubmit={onSubmit}>
      {children}
    </DynamicForm>
  )
}