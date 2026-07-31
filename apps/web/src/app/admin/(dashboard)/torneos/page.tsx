import { CreateTournamentForm, TournamentStatusButton } from '@/components/admin/TournamentAdminForms'
import { getTournaments } from '@/lib/api'
import { centsToMoney } from '@/lib/format'

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments()

  return (
    <>
      <div>
        <div className="admin-page-title">Torneos</div>
        <div className="admin-page-sub">Crear torneos y avanzar su estado manualmente.</div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Nuevo torneo</div>
        <CreateTournamentForm />
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Torneos existentes</div>
        {tournaments.items.length === 0 ? (
          <div className="admin-empty">Sin torneos todavía.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Pozo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.items.map((t) => (
                  <tr key={t.id}>
                    <td className="wrap">{t.name}</td>
                    <td>{t.type}</td>
                    <td>
                      <span className="admin-pill accent">{t.status}</span>
                    </td>
                    <td className="admin-mono">{centsToMoney(t.prizePoolCents)}</td>
                    <td>
                      <TournamentStatusButton tournament={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
