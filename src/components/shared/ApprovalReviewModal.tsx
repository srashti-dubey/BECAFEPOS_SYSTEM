import { useMemo, useState } from 'react'
import { Button } from '@/components/shared/Button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import { Textarea } from '@/components/shared/Textarea'
import {
  buildApprovalComparisonRows,
  canShowApprovalActions,
  formatApprovalAction,
  getApprovalRequestId,
} from '@/lib/approval'
import type { RecordApproval } from '@/types/approval'
import styles from './ApprovalReviewModal.module.css'

type ApprovalReviewModalProps = {
  open: boolean
  approval: RecordApproval | null
  canApprove?: boolean
  approving?: boolean
  rejecting?: boolean
  onClose: () => void
  onApprove?: (requestId: number) => void | Promise<void>
  onReject?: (requestId: number, comment?: string) => void | Promise<void>
}

function formatSubmittedAt(value?: string) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export function ApprovalReviewModal({
  open,
  approval,
  canApprove = false,
  approving = false,
  rejecting = false,
  onClose,
  onApprove,
  onReject,
}: ApprovalReviewModalProps) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectComment, setRejectComment] = useState('')

  const rows = useMemo(() => (approval ? buildApprovalComparisonRows(approval) : []), [approval])
  const requestId = getApprovalRequestId(approval)
  const showActions = Boolean(approval && canShowApprovalActions(canApprove, approval) && onApprove && onReject)
  const busy = approving || rejecting

  const title = approval?.request_no ? `Review ${approval.request_no}` : 'Review request'

  async function handleApprove() {
    if (!requestId || !onApprove) {
      return
    }
    await onApprove(requestId)
  }

  async function handleConfirmReject() {
    if (!requestId || !onReject) {
      return
    }
    await onReject(requestId, rejectComment)
    setRejectOpen(false)
    setRejectComment('')
  }

  function handleClose() {
    if (busy) {
      return
    }
    setRejectOpen(false)
    setRejectComment('')
    onClose()
  }

  return (
    <>
      <Modal open={open && Boolean(approval)} title={title} onClose={handleClose} size="lg">
        {approval ? (
          <>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Request type</span>
                <span className={styles.metaValue}>{formatApprovalAction(approval.action)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Requested by</span>
                <span className={styles.metaValue}>
                  {approval.maker_name ?? approval.requested_by?.name ?? '—'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Submitted</span>
                <span className={styles.metaValue}>
                  {formatSubmittedAt(approval.submitted_at ?? approval.requested_by?.submitted_at)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Fields changed</span>
                <span className={styles.metaValue}>
                  {approval.changed_fields?.length ? approval.changed_fields.join(', ') : '—'}
                </span>
              </div>
            </div>

            {rows.length > 0 ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Field</th>
                      <th scope="col">Current</th>
                      <th scope="col" className={styles.requestedHeader}>
                        Requested
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.field} className={row.changed ? styles.changedRow : undefined}>
                        <td>{row.label}</td>
                        <td>{row.current}</td>
                        <td className={row.changed ? styles.changedValue : undefined}>{row.requested}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>No field comparison data available for this request.</p>
            )}

            {approval.has_rejected && approval.rejection_reason ? (
              <div className={styles.reason}>
                <strong>Rejection reason:</strong> {approval.rejection_reason}
              </div>
            ) : null}

            {showActions ? (
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  className={styles.rejectButton}
                  disabled={busy}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
                <Button variant="primary" loading={approving} disabled={busy} onClick={() => void handleApprove()}>
                  Approve
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={rejectOpen}
        title="Reject request"
        message="Provide an optional reason for rejecting this request."
        confirmLabel="Reject"
        destructive
        loading={rejecting}
        onCancel={() => {
          if (rejecting) {
            return
          }
          setRejectOpen(false)
          setRejectComment('')
        }}
        onConfirm={() => void handleConfirmReject()}
      >
        <div className={styles.rejectForm}>
          <Textarea
            value={rejectComment}
            onChange={(event) => setRejectComment(event.target.value)}
            placeholder="Rejection reason (optional)"
            rows={3}
            disabled={rejecting}
          />
        </div>
      </ConfirmDialog>
    </>
  )
}
