import type { FieldValues, UseFormReturn } from 'react-hook-form'

export type FormContextValue<TFieldValues extends FieldValues = FieldValues> = UseFormReturn<TFieldValues>
