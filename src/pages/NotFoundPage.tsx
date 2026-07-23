import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { ROUTES } from '@/constants/routes'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Page not found</h2>
      <p className={styles.description}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to={ROUTES.pos}>
        <Button>Back to POS</Button>
      </Link>
    </div>
  )
}
