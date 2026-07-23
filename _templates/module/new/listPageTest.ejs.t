---
to: src/features/<%= folder %>/pages/<%= singular %>ListPage.test.tsx
---
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
<%_ if (isDynamicForm) { _%>
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
<%_ } _%>
import <%= singular %>ListPage from './<%= singular %>ListPage'
import type { <%= singular %> } from '@/features/<%= folder %>/types'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockRecord: <%= singular %> = {
  id: '<%= idPrefix %>-1',
<%_ fields.forEach(function(field) { _%>
  <%= field.name %>: <%- JSON.stringify(field.testSampleValue) %>,
<%_ }) _%>
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

vi.mock('@/auth/hooks', () => ({
  useRoutePermissionGuard: () => true,
}))

// FormModal (rendered by ListPage, always mounted even when closed) pulls in the create/update
// mutations too, so the mock hooks barrel below has to cover every hook it and ListPage use.
vi.mock('@/features/<%= folder %>/hooks', () => ({
  use<%= plural %>Query: () => ({
    data: { data: [mockRecord], total: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDelete<%= singular %>Mutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreate<%= singular %>Mutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdate<%= singular %>Mutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApprove<%= singular %>Mutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReject<%= singular %>Mutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExport<%= plural %>Excel: () => ({ mutate: vi.fn(), isPending: false }),
}))

<%_ if (isDynamicForm) { _%>
// FormModal renders <DynamicFormContainer>, and the list page's columns come from the same
// fetched schema (see forms/useDynamicColumns.ts) — both need a real QueryClient in scope, and
// this mock feeds both. One field is enough to prove the schema drives the table's columns.
vi.mock('@/services/formService', () => ({
  fetchFormSchema: vi.fn().mockResolvedValue({
    formId: '<%= formId %>',
<%_ if (displayFieldObj) { _%>
    fields: [{ name: '<%= displayField %>', label: <%- JSON.stringify(displayFieldObj.label) %>, type: 'text' }],
<%_ } else { _%>
    fields: [],
<%_ } _%>
  }),
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
<%_ } _%>

function renderPage() {
  return render(
    <MemoryRouter>
<%_ if (isDynamicForm) { _%>
      <QueryClientProvider client={queryClient}>
        <<%= singular %>ListPage />
      </QueryClientProvider>
<%_ } else { _%>
      <<%= singular %>ListPage />
<%_ } _%>
    </MemoryRouter>,
  )
}

describe('<%= singular %>ListPage', () => {
  it('renders the seeded record', async () => {
    renderPage()

    expect(screen.getByText('<%= plural %>')).toBeInTheDocument()
<%_ if (displayFieldObj) { _%>
    // findByText (not getByText): <%= isDynamicForm ? 'the column itself comes from an async, if mocked, schema fetch (see forms/useDynamicColumns.ts)' : 'kept async here too so this assertion behaves the same regardless of form mode' %>.
    expect(await screen.findByText(String(<%- JSON.stringify(displayFieldObj.testSampleValue) %>))).toBeInTheDocument()
<%_ } _%>
  })

  it('opens the create modal when "Add <%= singular %>" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /add <%= singular %>/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
