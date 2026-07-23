import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { ROUTES } from '@/constants/routes'
import styles from './UnauthorizedPage.module.css'

export default function UnauthorizedPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>403</h1>
      <h2 className={styles.title}>You don't have access to this page</h2>
      <p className={styles.description}>Contact your administrator if you believe this is a mistake.</p>
      <Link to={ROUTES.dashboard}>
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
