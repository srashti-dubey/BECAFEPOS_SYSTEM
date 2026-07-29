import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CustomerListPage from './CustomerListPage'
import type { Customer } from '@/features/customers/types'
import type { PendingCustomer } from '@/database/appDatabase'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockRecord: Customer = {
  id: 'cus-1',
  name: "Test Name",
  mobile: "9876543210",
  email: "email@example.com",
  remarks: "Test Remarks",
  loyalty_points: 42,
  can_notify: "Test Can notify",
  branch_id: 1,
  status: "active",
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

const mockPendingCustomer: PendingCustomer = {
  id: 7,
  operation: 'create',
  data: {
    name: 'Draft Name',
    mobile: '9876543210',
    email: 'draft@example.com',
    remarks: 'Draft',
    loyalty_points: 5,
    can_notify: 'yes',
    branch_id: 1,
    status: 'active',
  },
  synced: false,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const mockDeleteLocalMutateAsync = vi.fn().mockResolvedValue(undefined)
const mockUpdateLocalMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('@/auth/hooks', () => ({
  useRoutePermissionGuard: () => true,
}))

vi.mock('@/features/customers/services/customerSyncService', () => ({
  syncPendingCustomers: vi.fn().mockResolvedValue({ synced: 0, failed: 0 }),
}))

// FormModal (rendered by ListPage, always mounted even when closed) pulls in the create/update
// mutations too, so the mock hooks barrel below has to cover every hook it and ListPage use.
vi.mock('@/features/customers/hooks', () => ({
  useCustomersQuery: () => ({
    data: { data: [mockRecord], total: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  usePendingCustomersQuery: () => ({
    data: [mockPendingCustomer],
    isLoading: false,
  }),
  useDeleteCustomerMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteLocalCustomerMutation: () => ({ mutateAsync: mockDeleteLocalMutateAsync, isPending: false }),
  useCreateCustomerMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCustomerMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateLocalCustomerMutation: () => ({ mutateAsync: mockUpdateLocalMutateAsync, isPending: false }),
  useApproveCustomerMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectCustomerMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExportCustomersExcel: () => ({ mutate: vi.fn(), isPending: false }),
}))


function renderPage() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CustomerListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CustomerListPage', () => {
  it('renders the seeded record', async () => {
    renderPage()

    expect(screen.getByText('Customers')).toBeInTheDocument()
    // findByText (not getByText): kept async here too so this assertion behaves the same regardless of form mode.
    expect(await screen.findByText(String("Test Name"))).toBeInTheDocument()
  })

  it('opens the create modal when "Add Customer" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /add Customer/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows a pending (unsynced) row with a "Pending sync" badge', async () => {
    renderPage()

    expect(await screen.findByText('Draft Name')).toBeInTheDocument()
    expect(screen.getByText('Pending sync')).toBeInTheDocument()
  })

  it('opens the edit modal when clicking Edit on a pending row', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Draft Name')
    const pendingRow = screen.getByText('Draft Name').closest('tr') as HTMLElement
    const editButton = Array.from(pendingRow.querySelectorAll('button')).find((b) => /edit/i.test(b.textContent ?? ''))
    expect(editButton).toBeTruthy()

    await user.click(editButton!)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/edit customer/i)).toBeInTheDocument()
  })

  it('opens the confirm dialog when clicking Delete on a pending row', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Draft Name')
    const pendingRow = screen.getByText('Draft Name').closest('tr') as HTMLElement
    const deleteButton = Array.from(pendingRow.querySelectorAll('button')).find((b) => /delete/i.test(b.textContent ?? ''))
    expect(deleteButton).toBeTruthy()

    await user.click(deleteButton!)

    expect(screen.getByText(/delete customer/i)).toBeInTheDocument()
  })
})
