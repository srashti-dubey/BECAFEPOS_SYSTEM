# Testing guide

## Stack

[Vitest](https://vitest.dev) (jsdom environment) + [React Testing Library](https://testing-library.com/react)
+ [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom) matchers +
[`@testing-library/user-event`](https://testing-library.com/docs/user-event/intro). Config lives in
`vite.config.ts`'s `test` block; the RTL cleanup + jest-dom matcher setup is in `src/test/setup.ts`.

No mocking library (MSW etc.) is installed — API calls are avoided in tests by mocking the
`services`/`hooks` layer directly with `vi.mock`, not by intercepting HTTP.

## Running tests

```
npm test              # run once (CI mode)
npm run test:watch    # watch mode
npx vitest run src/features/users     # scope to a path
```

`npm test` exits non-zero with "No test files found" if literally nothing matches — expected
until at least one module has tests (see below), not a failure of the tooling itself.

## Where tests live

Co-located next to the code they test, `*.test.ts` / `*.test.tsx`, e.g.
`src/features/users/schemas/userSchema.test.ts` next to `userSchema.ts`. No separate `__tests__/`
tree.

## Tests you get for free

`npx hygen module new` generates 3 test files per module automatically — schema,
form modal, list page. See [`_templates/module/new/README.md`](_templates/module/new/README.md#generated-tests)
for exactly what each one covers and where it deliberately leaves a `TODO` instead of guessing.
Existing modules generated before this was added (`users`, `roles`, `menus`) don't have tests
unless you regenerate them or add tests by hand using the patterns below.

## Writing tests by hand

### Zod schemas

Test each field against its own sub-schema via `.shape`, not the whole object — one field
with an awkward rule (e.g. a custom regex) then can't stop every other field from being
tested:

```ts
import { describe, expect, it } from 'vitest'
import { userFormSchema } from './userSchema'

describe('userFormSchema', () => {
  it('rejects an invalid email', () => {
    const result = userFormSchema.shape.email.safeParse('not-an-email')
    expect(result.success).toBe(false)
  })
})
```

### Components (FormModal, ListPage, etc.)

Mock the feature's `hooks` barrel (`@/features/<module>/hooks`) rather than reaching for a real
`QueryClientProvider` — these are smoke tests of the generated wiring, not React Query
integration tests:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserFormModal } from './UserFormModal'

// vi.mock factories are hoisted above imports — any outer variable they reference must be
// prefixed with "mock", the one exemption Vitest's hoisting makes for forward references.
const mockMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('@/features/users/hooks', () => ({
  useCreateUserMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useUpdateUserMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

it('renders the dialog', () => {
  render(<UserFormModal open onClose={vi.fn()} />)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
```

Query gotchas specific to this component library:

- **Text/number/select fields**: `FormField` renders `<label htmlFor={fieldId}>{label} *</label>`
  — the trailing `" *"` on required fields means `getByLabelText('Name')` (exact match) won't
  match. Use `getByLabelText(/^Name/)` instead.
- **Checkboxes**: `Checkbox` renders its own internal `<label>` in addition to `FormField`'s,
  so two `<label for>` elements point at the same input. Query by role instead:
  `getByRole('checkbox', { name: /is active/i })`.
- **Modal**: renders via `createPortal(..., document.body)` with `role="dialog"` — `screen`
  queries still find it fine since RTL binds to `document.body` by default, but don't scope
  queries to a `render()` result's container if the thing you're looking for is a modal.
- **List pages**: wrap in `<MemoryRouter>` (they call `useNavigate`) and mock
  `@/auth/hooks`'s `useRoutePermissionGuard` — real permission-store setup isn't worth it for a
  rendering smoke test.

## Troubleshooting

**"Cannot access 'X' before initialization" inside a `vi.mock(...)` factory** — the outer
variable isn't prefixed with `mock`. Vitest hoists `vi.mock()` calls above all imports and
`const` declarations except ones starting with `mock`; rename the variable.

**A query that should find an element doesn't** — print the DOM with `screen.debug()` before
assuming the query is wrong; label/role association bugs (see gotchas above) are the usual
cause, not a rendering failure.
