import { Select } from '@/components/shared/Select'
import { useRolesQuery } from '@/features/roles/hooks'
import type { Role } from '@/features/roles/types'

type RoleSelectProps = {
  value: string
  onChange: (roleId: string, role: Role | undefined) => void
}

// No "all roles, unpaginated" endpoint exists yet — uses a large page size as a
// "just give me everything" workaround instead.
export function RoleSelect({ value, onChange }: RoleSelectProps) {
  const rolesQuery = useRolesQuery({ page: 1, pageSize: 1000 })
  const roles = rolesQuery.data?.data ?? []

  return (
    <Select
      value={value}
      onChange={(event) => {
        const roleId = event.target.value
        // Role.id is typed as `string`, but the real API returns bare JSON numbers for it (the
        // same way /permissions' role_id came back as a number, not "29") — a native <select>'s
        // value is always a string, so comparing without coercion silently never matches a
        // real (numeric) role, and the dropdown snaps back to the placeholder on every selection.
        onChange(roleId, roles.find((role) => String(role.id) === roleId))
      }}
      disabled={rolesQuery.isLoading}
      aria-label="Select Role"
    >
      <option value="">Select a role...</option>
      {roles.map((role) => (
        <option key={role.id} value={String(role.id)}>
          {role.name}
        </option>
      ))}
    </Select>
  )
}
