import { RedemptionRow } from '@/components/admin/RedemptionRow'
import { adminListRedemptions } from '@/lib/api'
import { getSessionToken } from '@/lib/session'

export default async function AdminRedemptionsPage() {
  const token = (await getSessionToken())!
  const redemptions = await adminListRedemptions(token)

  return (
    <>
      <div>
        <div className="admin-page-title">Canjes</div>
        <div className="admin-page-sub">Solicitudes de dinero real — contactar y transferir por fuera de la plataforma.</div>
      </div>

      <div className="admin-card">
        {redemptions.items.length === 0 ? (
          <div className="admin-empty">Sin solicitudes de canje.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Puntos</th>
                  <th>Teléfono</th>
                  <th>Nota</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.items.map((r) => (
                  <RedemptionRow key={r.id} redemption={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
