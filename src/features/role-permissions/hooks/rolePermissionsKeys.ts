export const rolePermissionsKeys = {
  all: ['role-permissions'] as const,
  forRole: (roleId: number, search?: string) => [...rolePermissionsKeys.all, roleId, search ?? ''] as const,
}
