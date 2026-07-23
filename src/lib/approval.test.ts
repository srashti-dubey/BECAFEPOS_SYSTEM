import { describe, expect, it } from 'vitest'
import {
  buildApprovalComparisonRows,
  canShowApprovalActions,
  formatApprovalAction,
  getApprovalBadgeLabel,
  getApprovalBadgeTone,
} from '@/lib/approval'
import type { RecordApproval } from '@/types/approval'

describe('approval helpers', () => {
  it('builds badge labels and tones from approval state', () => {
    expect(getApprovalBadgeLabel(undefined)).toBe('Approved')
    expect(getApprovalBadgeTone(undefined)).toBe('success')

    const pending: RecordApproval = {
      has_pending: true,
      has_rejected: false,
      action: 'DELETE',
      request_id: 12,
    }
    expect(getApprovalBadgeLabel(pending)).toBe('Delete pending')
    expect(getApprovalBadgeTone(pending)).toBe('warning')
    expect(canShowApprovalActions(true, pending)).toBe(true)
    expect(canShowApprovalActions(false, pending)).toBe(false)

    const rejected: RecordApproval = {
      has_pending: false,
      has_rejected: true,
      action: 'UPDATE',
      request_id: 8,
    }
    expect(getApprovalBadgeLabel(rejected)).toBe('Update rejected')
    expect(getApprovalBadgeTone(rejected)).toBe('danger')
    expect(canShowApprovalActions(true, rejected)).toBe(false)
  })

  it('formats action labels', () => {
    expect(formatApprovalAction('CREATE')).toBe('Add')
    expect(formatApprovalAction('UPDATE')).toBe('Update')
    expect(formatApprovalAction('DELETE')).toBe('Delete')
  })

  it('builds comparison rows highlighting changed fields only', () => {
    const approval: RecordApproval = {
      has_pending: true,
      has_rejected: false,
      action: 'UPDATE',
      changed_fields: ['status'],
      previous_data: {
        name: 'Barista',
        status: 'ACTIVE',
      },
      proposed_data: {
        name: 'Barista',
        status: 'INACTIVE',
      },
    }

    const rows = buildApprovalComparisonRows(approval)
    expect(rows.find((row) => row.field === 'status')).toMatchObject({
      current: 'Active',
      requested: 'Inactive',
      changed: true,
    })
    expect(rows.find((row) => row.field === 'name')).toMatchObject({
      requested: '—',
      changed: false,
    })
  })
})
