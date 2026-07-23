---
to: "<%= hasEnumFields ? `src/features/${folder}/constants.ts` : '' %>"
---
import type { <%= enumFields.map(function(f) { return singular + f.pascal }).join(', ') %> } from '@/features/<%= folder %>/types'

<%_ enumFields.forEach(function(field) { _%>
export const <%= field.optionsConstName %>: Array<{ value: <%= singular %><%= field.pascal %>; label: string }> = [
<%_ field.optionPairs.forEach(function(pair) { _%>
  { value: '<%= pair.value %>', label: '<%= pair.label %>' },
<%_ }) _%>
]

export function get<%= singular %><%= field.pascal %>Label(value: <%= singular %><%= field.pascal %>) {
  return <%= field.optionsConstName %>.find((option) => option.value === value)?.label ?? value
}

<%_ }) _%>
