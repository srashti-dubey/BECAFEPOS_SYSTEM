---
to: src/constants/routes.ts
inject: true
after: hygen:routes
skip_if: "<%= pluralCamel %>: '/admin/<%= folder %>'"
---
  <%= pluralCamel %>: '/admin/<%= folder %>',
  <%= singularCamel %>Detail: (id: string) => `/admin/<%= folder %>/${id}`,
