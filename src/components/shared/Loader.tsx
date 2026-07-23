import { Spinner } from '@/components/shared/Spinner'
import styles from './Loader.module.css'

type LoaderProps = {
  label?: string
  fullHeight?: boolean
}

export function Loader({ label = 'Loading...', fullHeight = false }: LoaderProps) {
  return (
    <div className={[styles.loader, fullHeight ? styles.fullHeight : ''].filter(Boolean).join(' ')}>
      <Spinner size="lg" />
      <p className={styles.label}>{label}</p>
    </div>
  )
}
