import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ApprovalStatusCell } from '@/components/shared/ApprovalStatusCell'
import { Button } from '@/components/shared/Button'
import { isFieldListable } from '@/forms/dynamicFormUtils'
import { canShowApprovalActions } from '@/lib/approval'
import type { DynamicFieldConfig } from '@/forms/dynamicFormTypes'
import { fetchFormSchema } from '@/services/formService'
import type { RecordApproval, WithRecordApproval } from '@/types'

export type DynamicRecord = Record<string, unknown> & { id: string }

type UseDynamicColumnsOptions<TRecord> = {
  /** Same formId the module's Add/Edit form fetches its schema from — the listing's columns
   * describe the same entity, so they're derived from the same schema instead of a second one. */
  formId: string
  onView: (record: TRecord) => void
  onEdit: (record: TRecord) => void
  onDelete: (record: TRecord) => void
  canUpdate: boolean
  canDelete: boolean
  /** Omit both to skip the Approval column/actions entirely (e.g. a module with no maker-checker workflow). */
  onReviewApproval?: (approval: RecordApproval) => void
  canApprove?: boolean
}

function approvalOf(record: unknown): RecordApproval | null | undefined {
  return (record as WithRecordApproval).approval
}

function renderDynamicListValue(field: DynamicFieldConfig, value: unknown) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  if (field.type === 'checkbox' || field.type === 'switch') {
    return value ? 'Yes' : 'No'
  }

  if (field.type === 'select' || field.type === 'radio') {
    // optionsSource-backed fields have no static `options` to resolve a label from at this
    // level (that mapping only exists once the field is actually rendered/fetched in a form) —
    // fall back to the raw value rather than fetching per-row.
    return field.options?.find((option) => option.value === value)?.label ?? String(value)
  }

  if (field.type === 'multi-select') {
    const values = Array.isArray(value) ? value : [value]
    return values.map((item) => field.options?.find((option) => option.value === item)?.label ?? String(item)).join(', ')
  }

  if (field.type === 'rating') {
    const score = Number(value)
    if (!Number.isFinite(score) || score <= 0) return ''
    return `${score}/5`
  }

  if (field.type === 'color') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <span
          style={{ width: 12, height: 12, borderRadius: '50%', display: 'inline-block', background: String(value) }}
        />
        {String(value)}
      </span>
    )
  }

  return String(value)
}

/**
 * Derives table columns from the same API-fetched form schema that drives a dynamic module's
 * Add/Edit form (see forms/DynamicFormContainer.tsx), instead of Hygen guessing a fixed column
 * set at generation time that can't know the real backend field names. Static modules don't use
 * this at all — they keep their own hand-coded, Hygen-generated `columns.tsx` (see
 * _templates/module/new/columns.ejs.t, which skips itself entirely in dynamic mode).
 */
export function useDynamicColumns<TRecord = DynamicRecord>({
  formId,
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
  onReviewApproval,
  canApprove = false,
}: UseDynamicColumnsOptions<TRecord>): { columns: ColumnDef<TRecord>[]; isLoading: boolean } {
  const schemaQuery = useQuery({
    // Same cache entry as the module's own "Add" form fetch (DynamicFormContainer with no
    // entityId) — opening the list page and then Add doesn't refetch the schema twice.
    queryKey: ['dynamic-form', formId, undefined],
    queryFn: () => fetchFormSchema(formId),
    enabled: Boolean(formId),
  })

  const columns = useMemo<ColumnDef<TRecord>[]>(() => {
    const fields = (schemaQuery.data?.fields ?? []).filter(isFieldListable)

    const fieldColumns: ColumnDef<TRecord>[] = fields.map((field) => ({
      id: field.name,
      header: field.label,
      // accessorFn (not accessorKey) — field.name is a runtime string from the fetched schema,
      // not a compile-time-known key of TRecord, so it can't satisfy accessorKey's `keyof`
      // constraint. Casting to a plain record here is what makes this genuinely generic over
      // any TRecord shape.
      accessorFn: (row) => (row as Record<string, unknown>)[field.name],
      cell: ({ getValue }) => renderDynamicListValue(field, getValue()),
    }))

    const approvalColumn: ColumnDef<TRecord> | null = onReviewApproval
      ? {
          id: 'approval',
          header: 'Approval',
          enableSorting: false,
          cell: ({ row }) => <ApprovalStatusCell approval={approvalOf(row.original)} onReview={onReviewApproval} />,
        }
      : null

    const actionsColumn: ColumnDef<TRecord> = {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const showApprovalActions = onReviewApproval && canShowApprovalActions(canApprove, approvalOf(row.original))

        if (showApprovalActions) {
          const approval = approvalOf(row.original)
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
              {canUpdate ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(row.original)
                  }}
                >
                  Edit
                </Button>
              ) : null}
              <Button
                variant="primary"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  if (approval) {
                    onReviewApproval(approval)
                  }
                }}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="sm"
                style={{ background: 'var(--bg)', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={(event) => {
                  event.stopPropagation()
                  if (approval) {
                    onReviewApproval(approval)
                  }
                }}
              >
                Reject
              </Button>
            </div>
          )
        }

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                onView(row.original)
              }}
            >
              View
            </Button>
            {canUpdate ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(row.original)
                }}
              >
                Edit
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(row.original)
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>
        )
      },
    }

    return approvalColumn ? [...fieldColumns, approvalColumn, actionsColumn] : [...fieldColumns, actionsColumn]
  }, [schemaQuery.data, onView, onEdit, onDelete, canUpdate, canDelete, onReviewApproval, canApprove])

  return { columns, isLoading: schemaQuery.isLoading }
}
