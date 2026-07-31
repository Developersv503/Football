import { AdminCard } from '@/components/admin/AdminCard'
import { PageHeader } from '@/components/admin/PageHeader'
import { RedemptionsTable } from '@/components/admin/RedemptionsTable'
import { adminListRedemptions } from '@/lib/api'
import { getSessionToken } from '@/lib/session'

export default async function AdminRedemptionsPage() {
  const token = (await getSessionToken())!
  const redemptions = await adminListRedemptions(token)

  return (
    <>
      <PageHeader title="Canjes" subtitle="Solicitudes de dinero real — contactar y transferir por fuera de la plataforma." />
      <AdminCard>
        {redemptions.items.length === 0 ? (
          <div className="admin-empty">Sin solicitudes de canje.</div>
        ) : (
          <RedemptionsTable redemptions={redemptions.items} />
        )}
      </AdminCard>
    </>
  )
}
