import {
  canOpenApprovalReview,
  getApprovalBadgeLabel,
  getApprovalBadgeTone,
} from '@/lib/approval'
import type { RecordApproval } from '@/types/approval'
import styles from './ApprovalStatusCell.module.css'

type ApprovalStatusCellProps = {
  approval?: RecordApproval | null
  onReview?: (approval: RecordApproval) => void
}

export function ApprovalStatusCell({ approval, onReview }: ApprovalStatusCellProps) {
  const label = getApprovalBadgeLabel(approval)
  const tone = getApprovalBadgeTone(approval)
  const requestNo = approval?.request_no
  const interactive = Boolean(approval && canOpenApprovalReview(approval) && onReview)

  if (!interactive || !approval || !onReview) {
    return (
      <div className={[styles.cell, styles.static].join(' ')}>
        <span className={[styles.badge, styles[tone]].join(' ')}>{label}</span>
        {requestNo && (approval?.has_pending || approval?.has_rejected) ? (
          <span className={styles.requestNo}>{requestNo}</span>
        ) : null}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={[styles.cell, styles.interactive].join(' ')}
      onClick={(event) => {
        event.stopPropagation()
        onReview(approval)
      }}
      aria-label={`Review ${requestNo ?? label}`}
    >
      <span className={[styles.badge, styles[tone]].join(' ')}>{label}</span>
      {requestNo ? <span className={styles.requestNo}>{requestNo}</span> : null}
    </button>
  )
}
