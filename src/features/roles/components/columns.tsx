import type { ColumnDef } from '@tanstack/react-table'
import { ApprovalStatusCell } from '@/components/shared/ApprovalStatusCell'
import { Button } from '@/components/shared/Button'
import { canShowApprovalActions } from '@/lib/approval'
import type { Role } from '@/features/roles/types'
import type { RecordApproval } from '@/types/approval'
import styles from './columns.module.css'

type RoleColumnsOptions = {
  onView: (record: Role) => void
  onEdit: (record: Role) => void
  onDelete: (record: Role) => void
  onReviewApproval: (approval: RecordApproval) => void
  canUpdate: boolean
  canDelete: boolean
  canApprove: boolean
}

export function createRoleColumns({
  onView,
  onEdit,
  onDelete,
  onReviewApproval,
  canUpdate,
  canDelete,
  canApprove,
}: RoleColumnsOptions): ColumnDef<Role>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
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
      accessorKey: 'is_active',
      header: 'Is active',
      cell: ({ getValue }) => (getValue<boolean>() ? 'Yes' : 'No'),
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
