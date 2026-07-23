---
to: "<%= hasStatusField ? `src/features/${folder}/components/${singular}StatusBadge.tsx` : '' %>"
---
<%_ if (hasStatusField) {
  const statusField = fields.find(function(f) { return f.name === 'status' })
_%>
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { <%= singular %>Status } from '@/features/<%= folder %>/types'

const TONE_BY_STATUS: Record<<%= singular %>Status, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
<%_ statusField.optionPairs.forEach(function(pair) { _%>
  '<%= pair.value %>': '<%= pair.tone %>',
<%_ }) _%>
}

const LABEL_BY_STATUS: Record<<%= singular %>Status, string> = {
<%_ statusField.optionPairs.forEach(function(pair) { _%>
  '<%= pair.value %>': '<%= pair.label %>',
<%_ }) _%>
}

export function <%= singular %>StatusBadge({ status }: { status: <%= singular %>Status }) {
  return <StatusBadge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</StatusBadge>
}
<%_ } _%>
