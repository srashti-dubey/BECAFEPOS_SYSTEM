---
to: "<%= isDynamicForm ? '' : `src/features/${folder}/schemas/index.ts` %>"
---
export * from './<%= singularCamel %>Schema'
