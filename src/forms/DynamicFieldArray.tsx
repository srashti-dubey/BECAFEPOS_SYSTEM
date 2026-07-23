import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { FormField } from '@/forms/FormField'
import { isFieldRequired } from '@/forms/dynamicFormUtils'
import type { DynamicFieldConfig } from '@/forms/dynamicFormTypes'

type DynamicFieldArrayProps = {
  name: string
  subFields: DynamicFieldConfig[]
}

export function DynamicFieldArray({ name, subFields }: DynamicFieldArrayProps) {
  const form = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  })

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
          {subFields.map((subField) => {
            const fieldPath = `${name}.${index}.${subField.name}`
            const fieldId = subField.id ? `${subField.id}-${index}` : fieldPath

            return (
              <FormField
                key={subField.name}
                name={fieldPath as never}
                id={fieldId}
                className={subField.className}
                inputClassName={subField.inputClassName}
                label={subField.label}
                required={isFieldRequired(subField)}
              >
                {(fieldProps) => {
                  if (subField.type === 'number') {
                    return <Input type="number" placeholder={subField.placeholder} {...fieldProps} />
                  }

                  return <Input type="text" placeholder={subField.placeholder} {...fieldProps} />
                }}
              </FormField>
            )
          })}

          <Button type="button" variant="danger" size="sm" onClick={() => remove(index)}>
            Remove
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append(
            subFields.reduce<Record<string, unknown>>((acc, subField) => {
              acc[subField.name] = subField.defaultValue ?? (subField.type === 'number' ? 0 : '')
              return acc
            }, {}),
          )
        }
      >
        + Add Item
      </Button>
    </div>
  )
}
