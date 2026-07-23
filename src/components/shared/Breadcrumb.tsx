import { Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

type BreadcrumbProps = {
  items: Array<{ label: string; href?: string }>
}

export function SharedBreadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumb}>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className={styles.item}>
            {item.href && index < items.length - 1 ? (
              <Link to={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
