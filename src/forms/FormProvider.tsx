import type { ReactNode } from 'react'
import { FormProvider as RHFProvider, type FieldValues, type SubmitHandler, type UseFormReturn } from 'react-hook-form'
import { FormContext } from '@/forms/FormContext'
import type { FormContextValue } from '@/forms/types'

type FormProviderProps<TFieldValues extends FieldValues = FieldValues> = {
  form: UseFormReturn<TFieldValues>
  children: ReactNode
  onSubmit?: SubmitHandler<TFieldValues>
}

export function FormProvider<TFieldValues extends FieldValues = FieldValues>({
  form,
  children,
  onSubmit,
}: FormProviderProps<TFieldValues>) {
  return (
    <FormContext.Provider value={form as FormContextValue}>
      <RHFProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit ?? (() => undefined))}>{children}</form>
      </RHFProvider>
    </FormContext.Provider>
  )
}
