---
to: src/features/<%= folder %>/components/<%= singular %>FormModal.test.tsx
---
<%_ if (isDynamicForm) { _%>
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { <%= singular %>FormModal } from './<%= singular %>FormModal'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('@/features/<%= folder %>/hooks', () => ({
  useCreate<%= singular %>Mutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useUpdate<%= singular %>Mutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

// This module has no local opinion on the form's fields (they come from the API at runtime —
// see <%= singular %>FormModal.tsx), so this only smoke-tests that the modal opens and the
// dynamic form loads, rather than asserting individual fields.
vi.mock('@/services/formService', () => ({
  fetchFormSchema: vi.fn().mockResolvedValue({ formId: '<%= formId %>', fields: [] }),
}))

// DynamicFormContainer calls useQuery internally to fetch the form schema — needs a real
// QueryClient in scope; the mock above only covers what it fetches, not the query machinery.
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderModal() {
  return render(
    <QueryClientProvider client={queryClient}>
      <<%= singular %>FormModal open onClose={vi.fn()} />
    </QueryClientProvider>,
  )
}

describe('<%= singular %>FormModal', () => {
  it('opens and loads the dynamic form', async () => {
    renderModal()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /create <%= singularCamel %>/i })).toBeInTheDocument()
  })
})
<%_ } else { _%>
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen<%= (hasDateFields && !hasUnsynthesizableField) ? ', fireEvent' : '' %>, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { <%= singular %>FormModal } from './<%= singular %>FormModal'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('@/features/<%= folder %>/hooks', () => ({
  useCreate<%= singular %>Mutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useUpdate<%= singular %>Mutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

describe('<%= singular %>FormModal', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear()
  })

  it('renders every field when open', () => {
    render(<<%= singular %>FormModal open onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
<%_ fields.forEach(function(field) { _%>
<%_ if (field.control === 'checkbox') { _%>
    expect(screen.getByRole('checkbox', { name: /<%= field.label %>/i })).toBeInTheDocument()
<%_ } else { _%>
    expect(screen.getByLabelText(/^<%= field.label %>/)).toBeInTheDocument()
<%_ } _%>
<%_ }) _%>
  })

<%_ if (hasUnsynthesizableField) { _%>
  // A field above uses a custom regex pattern with no auto-generated matching value (see the
  // TODO in schemas/<%= singularCamel %>Schema.test.ts), so a guaranteed-valid fill-and-submit test
  // can't be safely generated here. Fill in a real matching example and add one yourself if
  // you want that coverage.
<%_ } else { _%>
  it('submits valid input and calls the create mutation', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<<%= singular %>FormModal open onClose={onClose} />)

<%_ fields.forEach(function(field) { _%>
<%_ if (field.type === 'date') { _%>
    fireEvent.change(screen.getByLabelText(/^<%= field.label %>/), {
      target: { value: <%- JSON.stringify(field.testValidValue) %> },
    })
<%_ } else if (field.control === 'checkbox') { _%>
    await user.click(screen.getByRole('checkbox', { name: /<%= field.label %>/i }))
<%_ } else if (field.control === 'select') { _%>
    await user.selectOptions(screen.getByLabelText(/^<%= field.label %>/), <%- JSON.stringify(field.testValidValue) %>)
<%_ } else { _%>
    await user.type(screen.getByLabelText(/^<%= field.label %>/), <%- JSON.stringify(field.testValidValue) %>)
<%_ } _%>
<%_ }) _%>

    await user.click(screen.getByRole('button', { name: /create <%= singularCamel %>/i }))

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1))
    expect(onClose).toHaveBeenCalled()
  })
<%_ } _%>

<%_ if (hasEnforcedRequiredField) { _%>
  it('shows a validation error and does not submit when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<<%= singular %>FormModal open onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /create <%= singularCamel %>/i }))

    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0))
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
<%_ } _%>
})
<%_ } _%>
