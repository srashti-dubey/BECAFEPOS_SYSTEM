import { useMutation } from '@tanstack/react-query'
import { rolePermissionService } from '@/features/role-permissions/services/rolePermissionService'
import { notificationService } from '@/services/notificationService'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

// No existing file-download utility in the repo (first Excel export) — a plain temporary <a>
// with an object URL is the standard way to trigger a browser download from an in-memory blob.
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useExportRolePermissionsExcel() {
  return useMutation({
    mutationFn: async ({ roleId, search }: { roleId: number; search?: string }) => {
      const blob = await rolePermissionService.exportExcel(roleId, search)
      downloadBlob(blob, `role-${roleId}-permissions.xlsx`)
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to export permissions'))
    },
  })
}
