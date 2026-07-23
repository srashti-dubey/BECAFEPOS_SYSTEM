import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CityFormModal } from './CityFormModal'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('@/features/cities/hooks', () => ({
  useCreateCityMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useUpdateCityMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

// This module has no local opinion on the form's fields (they come from the API at runtime —
// see CityFormModal.tsx), so this only smoke-tests that the modal opens and the
// dynamic form loads, rather than asserting individual fields.
vi.mock('@/services/formService', () => ({
  fetchFormSchema: vi.fn().mockResolvedValue({ formId: 'city-form', fields: [] }),
}))

// DynamicFormContainer calls useQuery internally to fetch the form schema — needs a real
// QueryClient in scope; the mock above only covers what it fetches, not the query machinery.
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderModal() {
  return render(
    <QueryClientProvider client={queryClient}>
      <CityFormModal open onClose={vi.fn()} />
    </QueryClientProvider>,
  )
}

describe('CityFormModal', () => {
  it('opens and loads the dynamic form', async () => {
    renderModal()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /create city/i })).toBeInTheDocument()
  })
})
