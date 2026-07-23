import { BaseService } from '@/services/baseService'
import { fetchFieldOptions as mockFetchFieldOptions } from '@/mocks/dynamicFormsApi'
import type { DynamicFieldOption, DynamicOptionsSource } from '@/forms/dynamicFormTypes'

// These are placeholder demo endpoints with no real backend yet (see dynamicFormsApi.ts's
// MOCK_COUNTRIES/MOCK_STATES_BY_COUNTRY/MOCK_CITIES_BY_STATE) — everything else is assumed to be
// a real, live endpoint (e.g. a Hygen-generated module's own `/{module}/active/list`) and goes
// straight to the real API. Add a URL here only when there's genuinely no backend for it yet.
const MOCK_ONLY_URLS = new Set(['/locations/countries', '/locations/states', '/locations/cities'])

class DynamicFieldOptionsApi extends BaseService {
  fetchList(url: string, params?: Record<string, unknown>) {
    return this.get<unknown>(url, { params })
  }
}

const dynamicFieldOptionsApi = new DynamicFieldOptionsApi()

// Most `X/active/list` endpoints return the standard { data: [...] } envelope payload — but at
// least one observed real response nests it one level deeper as { payload: { data: [...] } }
// instead (no top-level `response_data`, so BaseService's usual unwrap doesn't touch it). Handle
// both rather than assuming one; a bare array is also accepted in case a future endpoint skips
// the wrapper entirely.
function extractListItems(result: unknown): unknown[] {
  if (Array.isArray(result)) {
    return result
  }

  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>
    if (Array.isArray(record.data)) {
      return record.data
    }
    if (record.payload && typeof record.payload === 'object') {
      const payload = record.payload as Record<string, unknown>
      if (Array.isArray(payload.data)) {
        return payload.data
      }
    }
  }

  return []
}

function toOption(item: unknown, source: DynamicOptionsSource): DynamicFieldOption {
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>
    const labelKey = source.labelKey ?? 'label'
    const valueKey = source.valueKey ?? 'value'
    const value = record[valueKey]
    return { label: String(record[labelKey] ?? value ?? ''), value: String(value ?? '') }
  }
  return { label: String(item), value: String(item) }
}

/**
 * Loads a select/multi-select field's options from an API instead of a static list. Real
 * endpoints (anything not in MOCK_ONLY_URLS) hit the actual backend through the same
 * BaseService plumbing every other API client uses (encryption, envelope unwrap, error
 * handling) — set `optionsSource.labelKey`/`valueKey` on the field when the endpoint's records
 * don't already come back as `{label, value}` (most won't; e.g. a State record has `id` and
 * `state_name`, not `value`/`label`).
 */
export async function fetchFieldOptions(
  source: DynamicOptionsSource,
  dependsOnValue?: unknown,
  searchQuery?: string,
): Promise<DynamicFieldOption[]> {
  if (MOCK_ONLY_URLS.has(source.url)) {
    return mockFetchFieldOptions(source, dependsOnValue, searchQuery)
  }

  const params = {
    ...(source.dependsOn && dependsOnValue !== undefined && dependsOnValue !== ''
      ? { [source.dependsOnParam ?? source.dependsOn]: dependsOnValue }
      : {}),
    ...(searchQuery ? { [source.searchParam ?? 'search']: searchQuery } : {}),
  }

  const result = await dynamicFieldOptionsApi.fetchList(source.url, Object.keys(params).length ? params : undefined)
  return extractListItems(result).map((item) => toOption(item, source))
}
