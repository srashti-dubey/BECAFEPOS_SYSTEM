import type { ReactNode } from 'react'
import styles from './StatusBadge.module.css'

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

type StatusBadgeProps = {
  tone: StatusTone
  children: ReactNode
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span className={[styles.badge, styles[tone]].join(' ')}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}
