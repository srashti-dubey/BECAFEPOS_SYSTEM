import type { ColumnDef } from '@tanstack/react-table'
import { ApprovalStatusCell } from '@/components/shared/ApprovalStatusCell'
import { Button } from '@/components/shared/Button'
import { BranchStatusBadge } from '@/features/branches/components/BranchStatusBadge'
import { canShowApprovalActions } from '@/lib/approval'
import type { Branch } from '@/features/branches/types'
import type { RecordApproval } from '@/types/approval'
import styles from './columns.module.css'

type BranchColumnsOptions = {
  onView: (record: Branch) => void
  onEdit: (record: Branch) => void
  onDelete: (record: Branch) => void
  onReviewApproval: (approval: RecordApproval) => void
  canUpdate: boolean
  canDelete: boolean
  canApprove: boolean
}

export function createBranchColumns({
  onView,
  onEdit,
  onDelete,
  onReviewApproval,
  canUpdate,
  canDelete,
  canApprove,
}: BranchColumnsOptions): ColumnDef<Branch>[] {
  return [
    {
      accessorKey: 'branch_name',
      header: 'Branch name',
    },
    {
      accessorKey: 'branch_code',
      header: 'Branch code',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      enableSorting: false,
    },
    {
      id: 'approval',
      header: 'Approval',
      enableSorting: false,
      cell: ({ row }) => (
        <ApprovalStatusCell approval={row.original.approval} onReview={onReviewApproval} />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <BranchStatusBadge status={getValue<Branch['status']>()} />,
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
