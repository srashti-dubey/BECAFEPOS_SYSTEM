import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomerFormModal } from './CustomerFormModal'
import type { Customer } from '@/features/customers/types'

// vi.mock factories are hoisted above imports, so any outer variable they reference must be
// prefixed with "mock" — that's the one exemption Vitest's hoisting makes for forward references.
const mockMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('@/features/customers/hooks', () => ({
  useCreateCustomerMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useUpdateCustomerMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useUpdateLocalCustomerMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('@/features/branches/hooks/useBranchesActiveListQuery', () => ({
  useBranchesActiveListQuery: () => ({
    data: { data: [{ id: '1', name: 'Andheri East' }] },
    isLoading: false,
  }),
}))

describe('CustomerFormModal', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear()
  })

  it('renders every field when open', () => {
    render(<CustomerFormModal open onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Mobile/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Remarks/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Loyalty points/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Can notify/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Branch/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Status/)).toBeInTheDocument()
  })

  it('submits valid input and calls the create mutation', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CustomerFormModal open onClose={onClose} />)

    await user.type(screen.getByLabelText(/^Name/), "Sample")
    await user.type(screen.getByLabelText(/^Mobile/), "9876543210")
    await user.type(screen.getByLabelText(/^Email/), "email@example.com")
    await user.type(screen.getByLabelText(/^Remarks/), "Sample")
    await user.type(screen.getByLabelText(/^Loyalty points/), "1")
    await user.type(screen.getByLabelText(/^Can notify/), "Sample")
    await user.selectOptions(screen.getByLabelText(/^Status/), "active")

    await user.click(screen.getByRole('button', { name: /create customer/i }))

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows a validation error and does not submit when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<CustomerFormModal open onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /create customer/i }))

    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0))
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('edits a pending (unsynced) customer via the local mutation, not the API mutation', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const pendingCustomer: Customer = {
      id: 'pending-1',
      name: 'Draft Name',
      mobile: '9876543210',
      email: 'draft@example.com',
      remarks: 'Draft',
      loyalty_points: 5,
      can_notify: 'yes',
      branch_id: 1,
      status: 'active',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      isPendingSync: true,
    }

    render(<CustomerFormModal open customer={pendingCustomer} onClose={onClose} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1))
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ pendingId: 1, data: expect.objectContaining({ name: 'Draft Name' }) }),
    )
    expect(onClose).toHaveBeenCalled()
  })
})
