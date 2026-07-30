import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { getMyPredictions } from '@/lib/api'
import { getViewer } from '@/lib/viewer'
import { kickoffTime, outcomeLabel, predictionStatusLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function PronosticosPage() {
  const { viewer, token } = await getViewer()

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="pronosticos" />

      <main>
        <div className="topbar">
          <div className="topbar-head">
            <div>
              <div className="page-title">Mis pronósticos</div>
              <div className="page-sub">Historial de tus pronósticos reales, con su resultado.</div>
            </div>
          </div>
        </div>

        {!token ? (
          <div className="empty-state">
            Iniciá sesión para ver tus pronósticos.
            <br />
            <Link href="/login" className="btn-auth-sm inline-link">
              Ingresar
            </Link>
          </div>
        ) : (
          <PredictionsList token={token} />
        )}
      </main>
    </div>
  )
}

async function PredictionsList({ token }: { token: string }) {
  const predictions = await getMyPredictions(token)

  if (predictions.items.length === 0) {
    return <div className="empty-state">Todavía no hiciste ningún pronóstico. Andá a Matches y elegí un partido programado.</div>
  }

  return (
    <div className="predictions-list">
      {predictions.items.map((p) => (
        <div className="prediction-row" key={p.id}>
          <div className="prediction-teams">
            <span>{p.event.homeTeam}</span>
            <span className="vs">vs</span>
            <span>{p.event.awayTeam}</span>
          </div>
          <div className="prediction-meta">
            <span className="prediction-time tnum">{kickoffTime(p.event.startTime)}</span>
            <span className="prediction-outcome">{outcomeLabel(p.outcome)}</span>
            <span className={`status-chip prediction-status-${p.status.toLowerCase()}`}>{predictionStatusLabel(p.status)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
