import type { ReactNode } from 'react'

type PermissionWrapperProps = {
  allowed: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionWrapper({ allowed, fallback = null, children }: PermissionWrapperProps) {
  return allowed ? <>{children}</> : <>{fallback}</>
}
