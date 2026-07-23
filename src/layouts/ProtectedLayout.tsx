import { Outlet } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import styles from './ProtectedLayout.module.css'

export function ProtectedLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Breadcrumb />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
