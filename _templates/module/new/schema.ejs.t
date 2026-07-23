---
to: "<%= isDynamicForm ? '' : `src/features/${folder}/schemas/${singularCamel}Schema.ts` %>"
---
import { z } from 'zod'
<%_ if (hasPhoneField) { _%>
import { REGEX } from '@/constants/regex'
<%_ } _%>

export const <%= singularCamel %>FormSchema = z.object({
<%_ fields.forEach(function(field) { _%>
  <%= field.name %>: <%- field.zod %>,
<%_ }) _%>
})

export type <%= singular %>FormValues = z.infer<typeof <%= singularCamel %>FormSchema>
