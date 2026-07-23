---
to: "<%= isDynamicForm ? '' : `src/features/${folder}/components/columns.tsx` %>"
---
import type { ColumnDef } from '@tanstack/react-table'
import { ApprovalStatusCell } from '@/components/shared/ApprovalStatusCell'
import { Button } from '@/components/shared/Button'
<%_ if (enumFields.some(function(f) { return f.name !== 'status' })) { _%>
import { <%= enumFields.filter(function(f) { return f.name !== 'status' }).map(function(f) { return 'get' + singular + f.pascal + 'Label' }).join(', ') %> } from '@/features/<%= folder %>/constants'
<%_ } _%>
<%_ if (hasStatusField) { _%>
import { <%= singular %>StatusBadge } from '@/features/<%= folder %>/components/<%= singular %>StatusBadge'
<%_ } _%>
import { canShowApprovalActions } from '@/lib/approval'
import type { <%= singular %> } from '@/features/<%= folder %>/types'
import type { RecordApproval } from '@/types/approval'
import styles from './columns.module.css'

type <%= singular %>ColumnsOptions = {
  onView: (record: <%= singular %>) => void
  onEdit: (record: <%= singular %>) => void
  onDelete: (record: <%= singular %>) => void
  onReviewApproval: (approval: RecordApproval) => void
  canUpdate: boolean
  canDelete: boolean
  canApprove: boolean
}

export function create<%= singular %>Columns({
  onView,
  onEdit,
  onDelete,
  onReviewApproval,
  canUpdate,
  canDelete,
  canApprove,
}: <%= singular %>ColumnsOptions): ColumnDef<<%= singular %>>[] {
  return [
<%_ fields.forEach(function(field) { _%>
    {
      accessorKey: '<%= field.name %>',
      header: '<%= field.label %>',
<%_ if (field.type === 'phone') { _%>
      enableSorting: false,
<%_ } _%>
<%_ if (field.name === 'status' && field.type === 'enum') { _%>
      cell: ({ getValue }) => <<%= singular %>StatusBadge status={getValue<<%= singular %>['<%= field.name %>']>()} />,
<%_ } else if (field.type === 'enum') { _%>
      cell: ({ getValue }) => get<%= singular %><%= field.pascal %>Label(getValue<<%= singular %>['<%= field.name %>']>()),
<%_ } else if (field.type === 'boolean') { _%>
      cell: ({ getValue }) => (getValue<boolean>() ? 'Yes' : 'No'),
<%_ } else if (field.type === 'date') { _%>
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
<%_ } _%>
    },
<%_ }) _%>
    {
      id: 'approval',
      header: 'Approval',
      enableSorting: false,
      cell: ({ row }) => <ApprovalStatusCell approval={row.original.approval} onReview={onReviewApproval} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const showApprovalActions = canShowApprovalActions(canApprove, row.original.approval)

        return (
          <div className={styles.actions}>
            {showApprovalActions ? (
              <>
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
                    if (row.original.approval) {
                      onReviewApproval(row.original.approval)
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.rejectButton}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (row.original.approval) {
                      onReviewApproval(row.original.approval)
                    }
                  }}
                >
                  Reject
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )
      },
    },
  ]
}
