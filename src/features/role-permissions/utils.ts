// Menu.id/Role.id are typed as `string`, but the real backend's menu_id/role_id come back as
// bare JSON numbers — TypeScript doesn't enforce the declared type at runtime, only the shape
// a real response actually has. Accepting both and coercing to a string before matching digits
// is what makes this safe against either.
export function extractNumericId(id: string | number): number {
  const digits = String(id).match(/\d+/)?.[0]
  return digits ? Number(digits) : 0
}
