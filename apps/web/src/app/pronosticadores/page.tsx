import { Sidebar } from '@/components/Sidebar'
import { getGlobalRanking } from '@/lib/api'
import { getViewer } from '@/lib/viewer'
import { accuracyPct, initials } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function PronosticadoresPage() {
  const { viewer } = await getViewer()
  const ranking = await getGlobalRanking(50)

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="pronosticadores" />

      <main>
        <div className="topbar">
          <div className="topbar-head">
            <div>
              <div className="page-title">Pronosticadores</div>
              <div className="page-sub">Ranking global por rendimiento — {ranking.items.length} pronosticadores activos.</div>
            </div>
          </div>
        </div>

        {ranking.items.length === 0 ? (
          <div className="empty-state">Todavía no hay ranking generado.</div>
        ) : (
          <div className="rail-card ranking-full-card">
            <div className="rank-list">
              {ranking.items.map((row, i) => (
                <div className="rank-row" key={row.userId}>
                  <div className="rank-num">{i + 1}</div>
                  <div className="rank-avatar">{initials(row.user.displayName)}</div>
                  <div className="rank-name">{row.user.displayName}</div>
                  <div className="rank-extra tnum">{row.totalPredictions} pron.</div>
                  <div className="rank-extra tnum">racha {row.currentStreak}</div>
                  <div className="rank-acc tnum">{accuracyPct(row.accuracyBasisPoints)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
