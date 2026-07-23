import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CityListPage from './CityListPage'
import type { City } from '@/features/cities/types'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockRecord: City = {
  id: 'cit-1',
  name: "Test Name",
  status: "active",
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

vi.mock('@/auth/hooks', () => ({
  useRoutePermissionGuard: () => true,
}))

// FormModal (rendered by ListPage, always mounted even when closed) pulls in the create/update
// mutations too, so the mock hooks barrel below has to cover every hook it and ListPage use.
vi.mock('@/features/cities/hooks', () => ({
  useCitiesQuery: () => ({
    data: { data: [mockRecord], total: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDeleteCityMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateCityMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCityMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApproveCityMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectCityMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExportCitiesExcel: () => ({ mutate: vi.fn(), isPending: false }),
}))

// FormModal renders <DynamicFormContainer>, and the list page's columns come from the same
// fetched schema (see forms/useDynamicColumns.ts) — both need a real QueryClient in scope, and
// this mock feeds both. One field is enough to prove the schema drives the table's columns.
vi.mock('@/services/formService', () => ({
  fetchFormSchema: vi.fn().mockResolvedValue({
    formId: 'city-form',
    fields: [{ name: 'name', label: "Name", type: 'text' }],
  }),
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderPage() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CityListPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('CityListPage', () => {
  it('renders the seeded record', async () => {
    renderPage()

    expect(screen.getByText('Cities')).toBeInTheDocument()
    // findByText (not getByText): the column itself comes from an async, if mocked, schema fetch (see forms/useDynamicColumns.ts).
    expect(await screen.findByText(String("Test Name"))).toBeInTheDocument()
  })

  it('opens the create modal when "Add City" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /add City/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
