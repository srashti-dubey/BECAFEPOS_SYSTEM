---
to: src/features/<%= folder %>/types/index.ts
---
import type { SortDirection, WithRecordApproval } from '@/types'

<%_ enumFields.forEach(function(field) { _%>
export type <%= singular %><%= field.pascal %> = <%- field.options.map(function(o) { return "'" + o + "'" }).join(' | ') %>
<%_ }) _%>

// extends WithRecordApproval: every module's list/get endpoints return maker-checker approval
// metadata on each record now (approval/record_approval_status) — see the module generator
// README's "Approvals" section.
export interface <%= singular %> extends WithRecordApproval {
  id: string
<%_ fields.forEach(function(field) { _%>
  <%= field.name %>: <%- field.type === 'enum' ? (singular + field.pascal) : field.tsType %>
<%_ }) _%>
  created_at: string
  updated_at: string
}

<%_ if (isDynamicForm) { _%>
// The Add/Edit form's actual fields come from the API at runtime (see <%= singular %>FormModal.tsx)
// rather than from the fields collected at generation time, so the write-side payload shape
// isn't known here — it's whatever the fetched form schema produces.
export type Create<%= singular %>Input = Record<string, unknown>

export type Update<%= singular %>Input = Record<string, unknown> & { id: string }
<%_ } else { _%>
export interface Create<%= singular %>Input {
<%_ fields.forEach(function(field) { _%>
  <%= field.name %>: <%- field.type === 'enum' ? (singular + field.pascal) : field.tsType %>
<%_ }) _%>
}

export interface Update<%= singular %>Input extends Create<%= singular %>Input {
  id: string
}
<%_ } _%>

export type <%= plural %>SortField = <%- fields.map(function(f) { return "'" + f.name + "'" }).concat(["'created_at'"]).join(' | ') %>

export interface <%= plural %>ListParams {
  page: number
  pageSize: number
  search?: string
<%_ enumFields.forEach(function(field) { _%>
  <%= field.name %>?: <%= singular %><%= field.pascal %>
<%_ }) _%>
  sortBy?: <%= plural %>SortField
  sortDirection?: SortDirection
  /** The backend includes each row's `approval` by default — set false to skip that join for a faster query. */
  include_approval?: boolean
}

export interface <%= plural %>ListResult {
  data: <%= singular %>[]
  total: number
  /** New-record creation requests awaiting approval — not yet real <%= singularCamel %> records, so they're kept separate from `data` rather than mixed in with an incomplete id. */
  pendingCreates?: <%= singular %>[]
}
