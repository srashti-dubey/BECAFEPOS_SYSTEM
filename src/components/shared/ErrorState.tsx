import type { ReactNode } from 'react'
import styles from './ErrorState.module.css'

type ErrorStateProps = {
  title?: string
  description?: string
  children?: ReactNode
}

export function ErrorState({ title = 'Something went wrong', description, children }: ErrorStateProps) {
  return (
    <section className={styles.state} role="alert">
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children ? <div className={styles.actions}>{children}</div> : null}
    </section>
  )
}
