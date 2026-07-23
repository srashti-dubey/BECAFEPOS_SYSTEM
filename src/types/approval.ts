export type ApprovalAction = 'CREATE' | 'UPDATE' | 'DELETE' | string
export type ApprovalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string

export type ApprovalDataValue = string | number | boolean | null | undefined | ApprovalDataValue[] | { [key: string]: ApprovalDataValue }

export type ApprovalDataRecord = Record<string, ApprovalDataValue>

export interface ApprovalActor {
  user_id?: number
  name?: string
  email?: string
  comment?: string | null
  submitted_at?: string
  acted_at?: string
  action?: string
}

export interface RecordApproval {
  has_pending: boolean
  has_rejected: boolean
  request_id?: number
  request_no?: string
  action?: ApprovalAction
  status?: ApprovalRequestStatus
  rejection_reason?: string | null
  maker_id?: number
  maker_name?: string
  maker_email?: string
  requested_by?: ApprovalActor
  action_by?: ApprovalActor
  submitted_at?: string
  changed_fields?: string[]
  proposed_data?: ApprovalDataRecord | null
  previous_data?: ApprovalDataRecord | null
}

/** Entities that include maker/checker approval metadata from list APIs. */
export type WithRecordApproval = {
  approval?: RecordApproval | null
  record_approval_status?: string | null
}
