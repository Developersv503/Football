import { AdminCard } from '@/components/admin/AdminCard'
import { PageHeader } from '@/components/admin/PageHeader'
import { UsersTable } from '@/components/admin/UsersTable'
import { adminListUsers } from '@/lib/api'
import { getSessionToken } from '@/lib/session'

export default async function AdminUsersPage() {
  const token = (await getSessionToken())!
  const users = await adminListUsers(token)

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle={`${users.items.length} usuarios · suspender, cambiar rol, ajustar puntos`}
      />
      <AdminCard>
        {users.items.length === 0 ? <div className="admin-empty">Sin usuarios todavía.</div> : <UsersTable users={users.items} />}
      </AdminCard>
    </>
  )
}
