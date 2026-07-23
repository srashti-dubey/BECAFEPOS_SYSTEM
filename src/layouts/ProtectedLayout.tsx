import { Outlet } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import styles from './ProtectedLayout.module.css'

export function ProtectedLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
