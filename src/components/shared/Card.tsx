import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  padded?: boolean
}

export function Card({ children, padded = true, className, ...props }: CardProps) {
  return (
    <section className={[styles.card, padded ? styles.padded : '', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </section>
  )
}
