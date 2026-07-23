---
to: src/features/index.ts
inject: true
after: hygen:features
skip_if: from '\./<%= folder %>'
---
export * from './<%= folder %>'
