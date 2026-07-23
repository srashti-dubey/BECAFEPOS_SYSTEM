---
to: "<%= isDynamicForm ? '' : `src/features/${folder}/schemas/${singularCamel}Schema.test.ts` %>"
---
import { describe, expect, it } from 'vitest'
import { <%= singularCamel %>FormSchema } from './<%= singularCamel %>Schema'

// Each field is checked against its own sub-schema (`.shape.<field>`) rather than parsing a
// whole object — that way one field with no safely-generatable case (see below) can't stop the
// rest of the fields from being tested.
describe('<%= singularCamel %>FormSchema', () => {
<%_ fields.forEach(function(field) { _%>
  describe('<%= field.name %>', () => {
<%_ if (field.testValidValue !== null) { _%>
    it('accepts a valid value', () => {
      const result = <%= singularCamel %>FormSchema.shape.<%= field.name %>.safeParse(<%- JSON.stringify(field.testValidValue) %>)
      expect(result.success).toBe(true)
    })
<%_ } _%>
<%_ if (field.testInvalidValue !== null) { _%>
    it('rejects an invalid value', () => {
      const result = <%= singularCamel %>FormSchema.shape.<%= field.name %>.safeParse(<%- JSON.stringify(field.testInvalidValue) %>)
      expect(result.success).toBe(false)
    })
<%_ } _%>
<%_ if (field.testValidValue === null) { _%>
    // "<%= field.name %>" uses a custom regex pattern (<%= field.pattern %>) with no
    // auto-generated matching value — add one yourself if you want positive-path coverage:
    // <%= singularCamel %>FormSchema.shape.<%= field.name %>.safeParse('<value matching the pattern>')
<%_ } _%>
  })
<%_ }) _%>
})
