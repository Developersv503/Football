import { UserRow } from '@/components/admin/UserRow'
import { adminListUsers } from '@/lib/api'
import { getSessionToken } from '@/lib/session'

export default async function AdminUsersPage() {
  const token = (await getSessionToken())!
  const users = await adminListUsers(token)

  return (
    <>
      <div>
        <div className="admin-page-title">Usuarios</div>
        <div className="admin-page-sub">{users.items.length} usuarios · suspender, cambiar rol, ajustar puntos</div>
      </div>

      <div className="admin-card">
        {users.items.length === 0 ? (
          <div className="admin-empty">Sin usuarios todavía.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Puntos</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.items.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
