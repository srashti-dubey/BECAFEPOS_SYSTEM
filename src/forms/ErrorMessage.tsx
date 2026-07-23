import type { FieldValues } from 'react-hook-form'
import { useFormContext } from '@/forms/FormContext'

export function ErrorMessage<TFieldValues extends FieldValues = FieldValues>({ name }: { name: keyof TFieldValues }) {
  const form = useFormContext<TFieldValues>()
  const error = form.formState.errors[name]?.message

  if (!error) {
    return null
  }

  return <p>{String(error)}</p>
}
