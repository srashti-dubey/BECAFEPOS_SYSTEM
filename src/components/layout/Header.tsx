import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/hooks'
import { Button } from '@/components/shared/Button'
import { ROUTES } from '@/constants/routes'
import { env } from '@/config/env'
import styles from './Header.module.css'

function formatRoleLabel(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className={styles.header}>
      <Link to={ROUTES.pos} className={styles.brand}>
        {env.VITE_APP_NAME}
      </Link>

      {user ? (
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{formatRoleLabel(user.role)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : null}
    </header>
  )
}
