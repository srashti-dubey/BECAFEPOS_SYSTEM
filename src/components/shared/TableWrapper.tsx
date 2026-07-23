import type { ReactNode } from 'react'
import styles from './TableWrapper.module.css'

type TableWrapperProps = {
  children: ReactNode
}

export function TableWrapper({ children }: TableWrapperProps) {
  return <div className={styles.wrapper}>{children}</div>
}
