import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { bootstrapAuth } from '@/auth/bootstrap'

export function AuthApp() {
  useEffect(() => {
    void bootstrapAuth()
  }, [])

  return <Outlet />
}
