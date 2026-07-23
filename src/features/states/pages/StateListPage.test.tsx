import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StateListPage from './StateListPage'
import type { State } from '@/features/states/types'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockRecord: State = {
  id: 'sta-1',
  state_name: "Test Name",
  status: "active",
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

vi.mock('@/auth/hooks', () => ({
  useRoutePermissionGuard: () => true,
}))

// FormModal (rendered by ListPage, always mounted even when closed) pulls in the create/update
// mutations too, so the mock hooks barrel below has to cover every hook it and ListPage use.
vi.mock('@/features/states/hooks', () => ({
  useStatesQuery: () => ({
    data: { data: [mockRecord], total: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDeleteStateMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateStateMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateStateMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApproveStateMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectStateMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExportStatesExcel: () => ({ mutate: vi.fn(), isPending: false }),
}))

// FormModal renders <DynamicFormContainer>, and the list page's columns come from the same
// fetched schema (see forms/useDynamicColumns.ts) — both need a real QueryClient in scope, and
// this mock feeds both. One field is enough to prove the schema drives the table's columns.
vi.mock('@/services/formService', () => ({
  fetchFormSchema: vi.fn().mockResolvedValue({
    formId: 'state-form',
    fields: [{ name: 'state_name', label: "Name", type: 'text' }],
  }),
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderPage() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <StateListPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('StateListPage', () => {
  it('renders the seeded record', async () => {
    renderPage()

    expect(screen.getByText('States')).toBeInTheDocument()
    // findByText (not getByText): the column itself comes from an async, if mocked, schema fetch (see forms/useDynamicColumns.ts).
    expect(await screen.findByText(String("Test Name"))).toBeInTheDocument()
  })

  it('opens the create modal when "Add State" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /add State/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
