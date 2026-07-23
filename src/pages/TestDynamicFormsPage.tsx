import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { DemoFormModal } from '@/features/demo-forms/components/DemoFormModal'
import { useDemoFormCatalogQuery, useFormSubmissionsQuery } from '@/features/demo-forms/hooks'
import type { DemoFormMeta } from '@/mocks/dynamicFormsApi'

const HIDDEN_KEYS = new Set(['id'])
const TITLE_CANDIDATE_KEYS = ['customerName', 'companyName', 'eventName', 'name', 'title', 'fullName']

function formatFieldLabel(key: string): string {
  const withSpaces = key.replace(/([A-Z])/g, ' $1').trim()
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase()
}

function isObjectArrayItem(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null && !Array.isArray(item)
}

function renderStringChips(values: string[]): ReactNode {
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {values.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-block',
            padding: '0.15rem 0.55rem',
            borderRadius: '999px',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            fontSize: '0.8rem',
          }}
        >
          {tag}
        </span>
      ))}
    </span>
  )
}

function renderDynamicValue(value: unknown): ReactNode {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '—'
    }

    if (value.every((item) => typeof item === 'string')) {
      return renderStringChips(value)
    }

    if (value.every(isObjectArrayItem)) {
      return value
        .map((item) =>
          Object.entries(item)
            .map(([key, entryValue]) => `${formatFieldLabel(key)}: ${String(entryValue)}`)
            .join(', '),
        )
        .join(' | ')
    }

    return JSON.stringify(value)
  }

  if (value == null) {
    return '—'
  }

  return String(value)
}

function getSubmissionTitle(record: Record<string, unknown>): string {
  for (const key of TITLE_CANDIDATE_KEYS) {
    if (typeof record[key] === 'string' && record[key]) {
      return String(record[key])
    }
  }

  const firstString = Object.entries(record).find(([key, value]) => key !== 'id' && typeof value === 'string' && value)
  return firstString ? String(firstString[1]) : String(record.id ?? 'Submission')
}

function SubmissionFieldRows({ record }: { record: Record<string, unknown> }) {
  const entries = Object.entries(record).filter(([key]) => !HIDDEN_KEYS.has(key))

  return (
    <>
      {entries.map(([key, value]) => (
        <p key={key} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'baseline' }}>
          <span>{formatFieldLabel(key)}:</span>
          <span>{renderDynamicValue(value)}</span>
        </p>
      ))}
    </>
  )
}

function FormSubmissionsPanel({
  form,
  onEdit,
}: {
  form: DemoFormMeta
  onEdit: (submission: Record<string, unknown> & { id: string }) => void
}) {
  const { data: submissions = [] } = useFormSubmissionsQuery(form.formId)

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {submissions.length === 0 ? (
        <p style={{ margin: 0, color: '#6b7280' }}>No submissions yet. Submit the form to verify cookie persistence.</p>
      ) : (
        submissions.map((submission) => (
          <div key={submission.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>{getSubmissionTitle(submission)}</h4>
            <SubmissionFieldRows record={submission} />
            <Button variant="secondary" size="sm" onClick={() => onEdit(submission)}>
              Edit
            </Button>
          </div>
        ))
      )}
    </div>
  )
}

export default function TestDynamicFormsPage() {
  const { data: catalog = [] } = useDemoFormCatalogQuery()
  const [activeForm, setActiveForm] = useState<DemoFormMeta | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<(Record<string, unknown> & { id: string }) | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const forms = useMemo(() => catalog, [catalog])

  function openCreate(form: DemoFormMeta) {
    setActiveForm(form)
    setSelectedSubmission(null)
    setIsModalOpen(true)
  }

  function openEdit(form: DemoFormMeta, submission: Record<string, unknown> & { id: string }) {
    setActiveForm(form)
    setSelectedSubmission(submission)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSelectedSubmission(null)
  }

  return (
    <div>
      <PageHeader
        title="Test Dynamic Forms"
        description="Dynamic form engine PoC: server-driven JSON schemas for feedback, supplier onboarding, and event booking."
      />

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {forms.map((form) => (
          <Card key={form.formId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>{form.title}</h3>
                <p style={{ margin: '0.35rem 0 0', color: '#6b7280' }}>{form.description}</p>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>formId: {form.formId}</p>
              </div>
              <Button onClick={() => openCreate(form)}>Add {form.title}</Button>
            </div>

            <FormSubmissionsPanel form={form} onEdit={(submission) => openEdit(form, submission)} />
          </Card>
        ))}
      </div>

      {activeForm ? (
        <DemoFormModal
          open={isModalOpen}
          formId={activeForm.formId}
          title={activeForm.title}
          submission={selectedSubmission}
          onClose={closeModal}
        />
      ) : null}
    </div>
  )
}
