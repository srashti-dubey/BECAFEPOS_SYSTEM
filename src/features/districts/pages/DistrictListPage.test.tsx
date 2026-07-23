import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DistrictListPage from './DistrictListPage'
import type { District } from '@/features/districts/types'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockRecord: District = {
  id: 'dis-1',
  district_name: "Test Name",
  status: "active",
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

vi.mock('@/auth/hooks', () => ({
  useRoutePermissionGuard: () => true,
}))

// FormModal (rendered by ListPage, always mounted even when closed) pulls in the create/update
// mutations too, so the mock hooks barrel below has to cover every hook it and ListPage use.
vi.mock('@/features/districts/hooks', () => ({
  useDistrictsQuery: () => ({
    data: { data: [mockRecord], total: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDeleteDistrictMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateDistrictMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDistrictMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApproveDistrictMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectDistrictMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExportDistrictsExcel: () => ({ mutate: vi.fn(), isPending: false }),
}))

// FormModal renders <DynamicFormContainer>, and the list page's columns come from the same
// fetched schema (see forms/useDynamicColumns.ts) — both need a real QueryClient in scope, and
// this mock feeds both. One field is enough to prove the schema drives the table's columns.
vi.mock('@/services/formService', () => ({
  fetchFormSchema: vi.fn().mockResolvedValue({
    formId: 'district-form',
    fields: [{ name: 'district_name', label: "Name", type: 'text' }],
  }),
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderPage() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DistrictListPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('DistrictListPage', () => {
  it('renders the seeded record', async () => {
    renderPage()

    expect(screen.getByText('Districts')).toBeInTheDocument()
    // findByText (not getByText): the column itself comes from an async, if mocked, schema fetch (see forms/useDynamicColumns.ts).
    expect(await screen.findByText(String("Test Name"))).toBeInTheDocument()
  })

  it('opens the create modal when "Add District" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /add District/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
