// Reference-data shape only — this app has no branches CRUD module yet, just the lookup
// used to populate branch_id dropdowns (e.g. customers form) from /branches/active/list.
export interface BranchOption {
  id: string
  name: string
  status?: string
}

export interface BranchesActiveListResult {
  data: BranchOption[]
}
