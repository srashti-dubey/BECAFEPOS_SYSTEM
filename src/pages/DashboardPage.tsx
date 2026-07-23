import { useAuthStore } from '@/auth/store'
import { Card } from '@/components/shared/Card'
import { PageHeader } from '@/components/shared/PageHeader'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <PageHeader title="Dashboard" description={user ? `Welcome back, ${user.name}.` : undefined} />
      <Card>
        <p>This is the application home screen. Feature modules will surface their summaries here.</p>
      </Card>
    </div>
  )
}
