import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

type EmptyStateProps = {
  title?: string
  description?: string
  children?: ReactNode
}

export function EmptyState({ title = 'No data', description, children }: EmptyStateProps) {
  return (
    <section className={styles.state}>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children ? <div className={styles.actions}>{children}</div> : null}
    </section>
  )
}
