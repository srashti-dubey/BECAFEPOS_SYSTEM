import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DynamicForm } from './DynamicForm'
import type { DynamicFormSchema } from './dynamicFormTypes'

const mockFetchFieldOptions = vi.fn()

vi.mock('@/services/dynamicFieldOptionsService', () => ({
  fetchFieldOptions: (...args: unknown[]) => mockFetchFieldOptions(...args),
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('DynamicForm — visibleWhen', () => {
  const schema: DynamicFormSchema = {
    formId: 'conditional-form',
    fields: [
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        defaultValue: 'personal',
        options: [
          { label: 'Personal', value: 'personal' },
          { label: 'Business', value: 'business' },
        ],
      },
      {
        name: 'gstin',
        label: 'GSTIN',
        type: 'text',
        visibleWhen: { field: 'category', equals: 'business' },
        validations: { required: true, customErrorMessage: 'GSTIN is required' },
      },
    ],
  }

  it('hides a gated field until its driver value matches, and does not require it while hidden', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />)

    expect(screen.queryByLabelText(/^GSTIN/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('gstin')
  })

  it('reveals and enforces the gated field once its driver value matches', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText('Category'), 'business')
    expect(screen.getByLabelText(/^GSTIN/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(screen.getByText('GSTIN is required')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('DynamicForm — optionsSource', () => {
  const schema: DynamicFormSchema = {
    formId: 'location-form',
    fields: [
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        defaultValue: '',
        options: [
          { label: 'Select a country', value: '' },
          { label: 'India', value: 'India' },
          { label: 'United States', value: 'United States' },
        ],
      },
      {
        name: 'state',
        label: 'State',
        type: 'select',
        optionsSource: { url: '/locations/states', dependsOn: 'country' },
      },
    ],
  }

  it('gates the dependent field until its driver has a value, then loads options for it', async () => {
    mockFetchFieldOptions.mockResolvedValue([{ label: 'Maharashtra', value: 'Maharashtra' }])
    const user = userEvent.setup()
    renderWithClient(<DynamicForm schema={schema} />)

    expect(screen.getByLabelText('State')).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('Country'), 'India')

    await waitFor(() => expect(screen.getByLabelText('State')).not.toBeDisabled())
    expect(mockFetchFieldOptions).toHaveBeenCalledWith({ url: '/locations/states', dependsOn: 'country' }, 'India')
    expect(await screen.findByRole('option', { name: 'Maharashtra' })).toBeInTheDocument()
  })

  it('resets the dependent field selection when the driver value changes', async () => {
    mockFetchFieldOptions.mockImplementation((_source: unknown, dependsOnValue: string) =>
      Promise.resolve(
        dependsOnValue === 'India'
          ? [{ label: 'Maharashtra', value: 'Maharashtra' }]
          : [{ label: 'California', value: 'California' }],
      ),
    )
    const user = userEvent.setup()
    renderWithClient(<DynamicForm schema={schema} />)

    await user.selectOptions(screen.getByLabelText('Country'), 'India')
    await screen.findByRole('option', { name: 'Maharashtra' })
    await user.selectOptions(screen.getByLabelText('State'), 'Maharashtra')
    expect(screen.getByLabelText('State')).toHaveValue('Maharashtra')

    await user.selectOptions(screen.getByLabelText('Country'), 'United States')

    await waitFor(() => expect(screen.getByLabelText('State')).toHaveValue(''))
  })

  it('shows the edited record\'s existing value once options load, not blank', async () => {
    // Ungated field (no dependsOn) whose options resolve after the field has already registered
    // with react-hook-form — reproduces edit mode, where initialData sets the value before the
    // async optionsSource fetch completes.
    let resolveOptions!: (options: { label: string; value: string }[]) => void
    mockFetchFieldOptions.mockReturnValue(
      new Promise((resolve) => {
        resolveOptions = resolve
      }),
    )

    const editSchema: DynamicFormSchema = {
      formId: 'district-form',
      fields: [{ name: 'state_id', label: 'State', type: 'select', optionsSource: { url: '/states/active/list' } }],
    }

    renderWithClient(<DynamicForm schema={editSchema} initialData={{ state_id: '3' }} />)

    resolveOptions([
      { label: 'Bihar', value: '3' },
      { label: 'Madhya Pradesh', value: '2' },
    ])

    await waitFor(() => expect(screen.getByLabelText('State')).toHaveValue('3'))
  })
})
