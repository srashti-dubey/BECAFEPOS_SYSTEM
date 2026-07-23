import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/auth/service'
import { Loader } from '@/components/shared/Loader'
import { ROUTES } from '@/constants/routes'

export default function LogoutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    void logout().then(() => navigate(ROUTES.login, { replace: true }))
  }, [navigate])

  return <Loader label="Signing out..." fullHeight />
}
