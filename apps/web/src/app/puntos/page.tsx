import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { RedemptionForm } from '@/components/RedemptionForm'
import { getMyPointsBalance, getMyPointsLedger, getRoundConfig } from '@/lib/api'
import { pointsReasonLabel, pointsToMoney } from '@/lib/format'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

export default async function PuntosPage() {
  const { viewer, token } = await getViewer()
  const roundConfig = await getRoundConfig()

  if (!viewer || !token) {
    return (
      <div className="shell">
        <Sidebar eventsToday={0} user={null} active="puntos" />
        <main>
          <div className="topbar">
            <div className="page-title">Mis puntos</div>
          </div>
          <div className="content-grid single">
            <div className="empty-state">
              <p>Iniciá sesión para ver tu saldo de puntos.</p>
              <Link href="/login" className="btn-auth-sm inline-link">
                Ingresar
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const [{ pointsBalance }, ledger] = await Promise.all([getMyPointsBalance(token), getMyPointsLedger(token)])

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="puntos" />
      <main>
        <div className="topbar">
          <div className="page-title">Mis puntos</div>
          <div className="page-sub">{roundConfig.roundLabel} · meta {roundConfig.targetPoints} pts</div>
        </div>

        <div className="content-grid points-grid">
          <div className="detail-card points-balance-card">
            <div className="detail-card-title">Saldo actual</div>
            <div className="points-balance tnum">{pointsBalance}</div>
            <div className="points-balance-money">
              ≈ {pointsToMoney(pointsBalance, roundConfig.pointsPerCurrencyUnit, roundConfig.currency)}
            </div>
            <div className="detail-foot">
              {roundConfig.pointsPerCurrencyUnit} pts = 1 {roundConfig.currency} · canje por transferencia manual
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-title">Canjear puntos por dinero</div>
            <RedemptionForm pointsBalance={pointsBalance} />
          </div>

          <div className="detail-card points-ledger-card">
            <div className="detail-card-title">Historial</div>
            {ledger.items.length === 0 ? (
              <div className="detail-empty">Todavía no tenés movimientos.</div>
            ) : (
              <div className="predictions-list">
                {ledger.items.map((entry) => (
                  <div className="prediction-row" key={entry.id}>
                    <span className="prediction-teams">{pointsReasonLabel(entry.reason)}</span>
                    <div className="prediction-meta">
                      <span>{new Date(entry.createdAt).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</span>
                      <span
                        className={`prediction-outcome tnum${entry.delta >= 0 ? ' points-positive' : ' points-negative'}`}
                      >
                        {entry.delta >= 0 ? '+' : ''}
                        {entry.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
