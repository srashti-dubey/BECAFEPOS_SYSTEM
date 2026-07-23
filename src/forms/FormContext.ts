import { createContext, useContext } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { FormContextValue } from '@/forms/types'

export const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext<TFieldValues extends FieldValues = FieldValues>() {
  const context = useContext(FormContext)

  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider')
  }

  return context as UseFormReturn<TFieldValues>
}
