import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BranchListPage from './BranchListPage'
import type { Branch } from '@/features/branches/types'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockRecord: Branch = {
  id: 'bra-1',
  parent_id: null,
  branch_name: 'Test Branch name',
  branch_code: 'BR-001',
  country: 'India',
  state: 'Maharashtra',
  city: 'Mumbai',
  locality: 'Andheri East',
  address: '123 Coffee Street',
  contact_no: '9876543210',
  status: 'active',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

vi.mock('@/auth/hooks', () => ({
  useRoutePermissionGuard: () => true,
}))

// FormModal (rendered by ListPage, always mounted even when closed) pulls in the create/update
// mutations too, so the mock hooks barrel below has to cover all four hooks it and ListPage use.
vi.mock('@/features/branches/hooks', () => ({
  useBranchesQuery: () => ({
    data: { data: [mockRecord], total: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDeleteBranchMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateBranchMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBranchMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApproveBranchMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectBranchMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

// FormModal renders <DynamicFormContainer>, which calls useQuery internally to fetch the form
// schema — needs a real QueryClient in scope, and something for it to fetch.
vi.mock('@/services/formService', () => ({
  fetchFormSchema: vi.fn().mockResolvedValue({ formId: 'branch-form', fields: [] }),
}))

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderPage() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <BranchListPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('BranchListPage', () => {
  it('renders the seeded record', () => {
    renderPage()

    expect(screen.getByText('Branches')).toBeInTheDocument()
    expect(screen.getByText(String('Test Branch name'))).toBeInTheDocument()
  })

  it('opens the create modal when "Add Branch" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /add Branch/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
