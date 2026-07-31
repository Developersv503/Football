import { adminGetDashboard } from '@/lib/api'
import { getSessionToken } from '@/lib/session'

export default async function AdminDashboardPage() {
  const token = (await getSessionToken())!
  const stats = await adminGetDashboard(token)

  return (
    <>
      <div>
        <div className="admin-page-title">Dashboard</div>
        <div className="admin-page-sub">Estado general de la plataforma en tiempo real.</div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Exposición en puntos</div>
          <div className="admin-stat-value warn admin-mono">{stats.pointsLiability}</div>
          <div className="admin-stat-sub">Lo que se le debe a los usuarios si todos canjean</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Canjes pendientes</div>
          <div className="admin-stat-value accent admin-mono">{stats.pendingRedemptions.count}</div>
          <div className="admin-stat-sub">{stats.pendingRedemptions.points} pts en cola</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Usuarios</div>
          <div className="admin-stat-value admin-mono">{stats.totalUsers}</div>
          <div className="admin-stat-sub">{stats.activeUsers} activos</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pronósticos hoy</div>
          <div className="admin-stat-value admin-mono">{stats.predictionsToday + stats.scorePredictionsToday}</div>
          <div className="admin-stat-sub">{stats.scorePredictionsToday} de marcador exacto</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Torneos activos</div>
          <div className="admin-stat-value admin-mono">{stats.activeTournaments}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Concursos abiertos</div>
          <div className="admin-stat-value admin-mono">{stats.openMatchContests}</div>
        </div>
      </div>
    </>
  )
}
