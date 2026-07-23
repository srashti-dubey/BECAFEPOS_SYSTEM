import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { ROUTES } from '@/constants/routes'
import { useMenusTreeQuery } from '@/features/menus/hooks'

type SidebarTreeItem = {
  id: string | number
  name: string
  route: string
  children?: SidebarTreeItem[]
}

const DYNAMIC_FORM_TEST_LINKS = [
  { to: ROUTES.testDynamicProducts, label: 'Test Dynamic Products' },
  { to: ROUTES.testDynamicForms, label: 'Test Dynamic Forms' },
] as const

export function Sidebar() {
  const treeQuery = useMenusTreeQuery({ active_only: true })
  const treeItems = treeQuery.data ?? []

  return (
    <aside className={styles.sidebar}>
      <nav aria-label="Primary">
        <ul className={styles.list}>
          {treeItems.map((item) => (
            <SidebarTreeLink key={item.id} item={item} />
          ))}
        </ul>

        <p className={styles.sectionLabel}>Dynamic Form Tests</p>
        <ul className={styles.list}>
          {DYNAMIC_FORM_TEST_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end
                className={({ isActive }) => [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function SidebarTreeLink({ item }: { item: SidebarTreeItem }) {
  const [open, setOpen] = useState(true)
  const hasChildren = Boolean(item.children && item.children.length > 0)

  return (
    <li>
      <div className={styles.itemRow}>
        <NavLink to={item.route} end className={({ isActive }) => [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')}>
          {item.name}
        </NavLink>
        {hasChildren ? (
          <button type="button" className={styles.toggle} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
            {open ? '−' : '+'}
          </button>
        ) : null}
      </div>
      {hasChildren && open ? (
        <ul className={styles.subList}>
          {item.children!.map((child) => (
            <SidebarTreeLink key={child.id} item={child} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
