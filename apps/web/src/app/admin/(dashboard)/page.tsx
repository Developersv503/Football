import { DashboardStats } from '@/components/admin/DashboardStats'
import { PageHeader } from '@/components/admin/PageHeader'
import { adminGetDashboard } from '@/lib/api'
import { getSessionToken } from '@/lib/session'

export default async function AdminDashboardPage() {
  const token = (await getSessionToken())!
  const stats = await adminGetDashboard(token)

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Estado general de la plataforma en tiempo real." />
      <DashboardStats stats={stats} />
    </>
  )
}
