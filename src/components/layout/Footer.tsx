import { env } from '@/config/env'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        © {new Date().getFullYear()} {env.VITE_APP_NAME}. All rights reserved.
      </p>
    </footer>
  )
}
