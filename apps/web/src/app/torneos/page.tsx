import { Sidebar } from '@/components/Sidebar'
import { JoinTournamentButton } from '@/components/JoinTournamentButton'
import { getTournaments } from '@/lib/api'
import { getViewer } from '@/lib/viewer'
import { centsToMoney, timeUntil } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Próximamente',
  ACTIVE: 'Activo',
  CLOSED: 'Cerrado',
  SETTLED: 'Liquidado',
}

export default async function TorneosPage() {
  const { viewer } = await getViewer()
  const tournaments = await getTournaments()

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="torneos" />

      <main>
        <div className="topbar">
          <div className="topbar-head">
            <div>
              <div className="page-title">Torneos de pronósticos</div>
              <div className="page-sub">Competí contra otros pronosticadores — el pool sale de las entradas del torneo.</div>
            </div>
          </div>
        </div>

        {tournaments.items.length === 0 ? (
          <div className="empty-state">No hay torneos activos en este momento.</div>
        ) : (
          <div className="tournament-grid">
            {tournaments.items.map((t) => (
              <div className="rail-card tournament-full-card" key={t.id}>
                <div className="rail-eyebrow">
                  {t.type === 'DAILY' ? 'Torneo diario' : t.type === 'MONTHLY' ? 'Torneo mensual' : 'Torneo especial'}
                </div>
                <div className="rail-title">{t.name}</div>
                <span className={`status-chip tournament-status status-${t.status.toLowerCase()}`}>{STATUS_LABEL[t.status]}</span>
                <div className="prize tnum">{centsToMoney(t.prizePoolCents)}</div>
                <div className="prize-sub">Pool de premios</div>
                <div className="t-meta">
                  <span>Entrada</span>
                  <b className="tnum">{centsToMoney(t.entryFeeCents)}</b>
                </div>
                {t.status === 'ACTIVE' ? (
                  <div className="t-meta">
                    <span>Cierra en</span>
                    <b className="tnum">{timeUntil(t.endAt)}</b>
                  </div>
                ) : null}
                {t.status === 'UPCOMING' || t.status === 'ACTIVE' ? (
                  <JoinTournamentButton tournamentId={t.id} isLoggedIn={Boolean(viewer)} />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
