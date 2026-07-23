import type { ColumnDef } from '@tanstack/react-table'
import { ApprovalStatusCell } from '@/components/shared/ApprovalStatusCell'
import { Button } from '@/components/shared/Button'
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge'
import { canShowApprovalActions } from '@/lib/approval'
import type { User } from '@/features/users/types'
import type { RecordApproval } from '@/types/approval'
import styles from './columns.module.css'

type UserColumnsOptions = {
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onReviewApproval: (approval: RecordApproval) => void
  canUpdate: boolean
  canDelete: boolean
  canApprove: boolean
}

export function createUserColumns({
  onView,
  onEdit,
  onDelete,
  onReviewApproval,
  canUpdate,
  canDelete,
  canApprove,
}: UserColumnsOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role_name',
      header: 'Role',
      cell: ({ getValue }) => getValue<User['role_name']>() ?? '—',
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
      cell: ({ getValue }) => <UserStatusBadge status={getValue<User['status']>()} />,
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
