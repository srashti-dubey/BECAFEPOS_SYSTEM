import { useLocation } from 'react-router-dom'
import { SharedBreadcrumb } from '@/components/shared/Breadcrumb'
import styles from './Breadcrumb.module.css'

function toLabel(segment: string) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function Breadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  const items = segments.map((segment, index) => ({
    label: segment === 'app' ? 'Home' : toLabel(segment),
    href: `/${segments.slice(0, index + 1).join('/')}`,
  }))

  return (
    <div className={styles.wrapper}>
      <SharedBreadcrumb items={items} />
    </div>
  )
}
