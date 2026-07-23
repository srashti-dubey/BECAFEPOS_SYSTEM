import type { ApprovalAction, ApprovalDataRecord, ApprovalDataValue, RecordApproval } from '@/types/approval'

export type ApprovalBadgeTone = 'success' | 'warning' | 'danger'

export type ApprovalComparisonRow = {
  field: string
  label: string
  current: string
  requested: string
  changed: boolean
}

export function getApprovalRequestId(approval?: RecordApproval | null): number | undefined {
  if (!approval) {
    return undefined
  }

  if (typeof approval.request_id === 'number') {
    return approval.request_id
  }

  return undefined
}

export function formatApprovalAction(action?: ApprovalAction | null): string {
  if (!action) {
    return 'Request'
  }

  const normalized = String(action).toUpperCase()
  if (normalized === 'CREATE') {
    return 'Add'
  }
  if (normalized === 'UPDATE') {
    return 'Update'
  }
  if (normalized === 'DELETE') {
    return 'Delete'
  }

  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()
}

export function getApprovalBadgeLabel(approval?: RecordApproval | null): string {
  if (!approval) {
    return 'Approved'
  }

  const actionLabel = formatApprovalAction(approval.action)

  if (approval.has_pending) {
    return `${actionLabel} pending`
  }

  if (approval.has_rejected) {
    return `${actionLabel} rejected`
  }

  return 'Approved'
}

export function getApprovalBadgeTone(approval?: RecordApproval | null): ApprovalBadgeTone {
  if (!approval) {
    return 'success'
  }

  if (approval.has_pending) {
    return 'warning'
  }

  if (approval.has_rejected) {
    return 'danger'
  }

  return 'success'
}

export function canOpenApprovalReview(approval?: RecordApproval | null): boolean {
  if (!approval) {
    return false
  }

  return Boolean(approval.has_pending || approval.has_rejected)
}

export function canShowApprovalActions(canApprove: boolean, approval?: RecordApproval | null): boolean {
  return Boolean(canApprove && approval?.has_pending && getApprovalRequestId(approval))
}

export function formatApprovalFieldLabel(field: string): string {
  if (!field) {
    return ''
  }

  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatApprovalValue(value: ApprovalDataValue): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '—'
    }
    return value.map((item) => formatApprovalValue(item)).join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  const text = String(value)
  if (text.toUpperCase() === 'ACTIVE') {
    return 'Active'
  }
  if (text.toUpperCase() === 'INACTIVE') {
    return 'Inactive'
  }

  return text
}

function collectFieldKeys(approval: RecordApproval): string[] {
  const keys = new Set<string>()

  Object.keys(approval.previous_data ?? {}).forEach((key) => keys.add(key))
  Object.keys(approval.proposed_data ?? {}).forEach((key) => keys.add(key))
  ;(approval.changed_fields ?? []).forEach((key) => keys.add(key))

  return Array.from(keys)
}

function isFieldChanged(approval: RecordApproval, field: string): boolean {
  if (approval.changed_fields?.includes(field)) {
    return true
  }

  const previous = approval.previous_data?.[field]
  const proposed = approval.proposed_data?.[field]

  if (proposed === undefined) {
    return false
  }

  return JSON.stringify(previous) !== JSON.stringify(proposed)
}

export function buildApprovalComparisonRows(approval: RecordApproval): ApprovalComparisonRow[] {
  const action = String(approval.action ?? '').toUpperCase()
  const proposed = (approval.proposed_data ?? {}) as ApprovalDataRecord
  const previous = (approval.previous_data ?? {}) as ApprovalDataRecord

  if (action === 'DELETE' && (proposed.deleted === true || Object.keys(proposed).length === 0 || proposed.id !== undefined)) {
    const fields = Object.keys(previous).length > 0 ? Object.keys(previous) : collectFieldKeys(approval)
    if (fields.length === 0) {
      return [
        {
          field: 'record',
          label: 'Record',
          current: 'Existing record',
          requested: 'Delete',
          changed: true,
        },
      ]
    }

    return fields.map((field) => ({
      field,
      label: formatApprovalFieldLabel(field),
      current: formatApprovalValue(previous[field]),
      requested: field === 'id' || proposed.deleted === true ? 'Delete' : '—',
      changed: field === 'id' || proposed.deleted === true || isFieldChanged(approval, field),
    }))
  }

  return collectFieldKeys(approval).map((field) => {
    const changed = isFieldChanged(approval, field)
    return {
      field,
      label: formatApprovalFieldLabel(field),
      current: formatApprovalValue(previous[field]),
      requested: changed ? formatApprovalValue(proposed[field]) : '—',
      changed,
    }
  })
}
