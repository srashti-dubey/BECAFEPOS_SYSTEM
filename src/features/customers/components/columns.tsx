import type { ColumnDef } from '@tanstack/react-table'
import { ApprovalStatusCell } from '@/components/shared/ApprovalStatusCell'
import { Button } from '@/components/shared/Button'
import { CustomerStatusBadge } from '@/features/customers/components/CustomerStatusBadge'
import { parsePendingCustomerId } from '@/features/customers/lib/pendingCustomer'
import { canShowApprovalActions } from '@/lib/approval'
import type { Customer } from '@/features/customers/types'
import type { RecordApproval } from '@/types/approval'
import styles from './columns.module.css'

type CustomerColumnsOptions = {
  onView: (record: Customer) => void
  onEdit: (record: Customer) => void
  onDelete: (record: Customer) => void
  onReviewApproval: (approval: RecordApproval) => void
  canUpdate: boolean
  canDelete: boolean
  canApprove: boolean
}

export function createCustomerColumns({
  onView,
  onEdit,
  onDelete,
  onReviewApproval,
  canUpdate,
  canDelete,
  canApprove,
}: CustomerColumnsOptions): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'mobile',
      header: 'Mobile',
      enableSorting: false,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
    },
    {
      accessorKey: 'loyalty_points',
      header: 'Loyalty points',
    },
    {
      accessorKey: 'can_notify',
      header: 'Can notify',
    },
    {
      accessorKey: 'branch_id',
      header: 'Branch id',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <CustomerStatusBadge status={getValue<Customer['status']>()} />,
    },
    {
      id: 'approval',
      header: 'Approval',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.isPendingDelete ? (
          <span className={styles.pendingDeleteBadge}>Pending delete</span>
        ) : row.original.isPendingSync || row.original.isPendingApprovalSync ? (
          <span className={styles.pendingBadge}>Pending sync</span>
        ) : (
          <ApprovalStatusCell approval={row.original.approval} onReview={onReviewApproval} />
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        // Only a true local draft (a queued create with no server id yet) has no detail page to
        // view — a real customer with a pending update or delete overlaid on it is still viewable.
        const isLocalDraft = parsePendingCustomerId(row.original.id) !== null
        const isPendingDelete = row.original.isPendingDelete
        const showApprovalActions =
          !row.original.isPendingSync &&
          !row.original.isPendingApprovalSync &&
          !isPendingDelete &&
          canShowApprovalActions(canApprove, row.original.approval)

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
                {!isLocalDraft ? (
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
                ) : null}
                {canUpdate && !isPendingDelete ? (
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
                {canDelete && !isPendingDelete ? (
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
