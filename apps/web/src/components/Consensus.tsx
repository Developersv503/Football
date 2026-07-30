import type { MatchDetail } from '@/lib/api'

/**
 * El plan trial de Sportradar no incluye el producto de probabilidades, así
 * que acá no se muestra ninguna probabilidad estimada. El único porcentaje
 * es el reparto real de lo que pronosticó la comunidad — dato propio y
 * verificable, no un pronóstico de la casa.
 */
export function Consensus({
  consensus,
  homeTeam,
  awayTeam,
}: {
  consensus: MatchDetail['consensus']
  homeTeam: string
  awayTeam: string
}) {
  const { total } = consensus

  const rows = [
    { key: 'home', label: homeTeam, count: consensus.home },
    { key: 'draw', label: 'Empate', count: consensus.draw },
    { key: 'away', label: awayTeam, count: consensus.away },
  ]

  return (
    <div className="detail-card">
      <div className="detail-card-title">Consenso de pronosticadores</div>

      {total === 0 ? (
        <div className="detail-empty">
          Todavía nadie pronosticó este partido. Sé el primero.
        </div>
      ) : (
        <>
          <div className="consensus-rows">
            {rows.map((row) => {
              const pct = Math.round((row.count / total) * 100)
              return (
                <div className="consensus-row" key={row.key}>
                  <div className="consensus-label">{row.label}</div>
                  <div className="consensus-track">
                    <div className={`consensus-bar ${row.key}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="consensus-pct tnum">{pct}%</div>
                </div>
              )
            })}
          </div>
          <div className="detail-foot">
            Sobre <b className="tnum">{total}</b> {total === 1 ? 'pronóstico' : 'pronósticos'} de la
            comunidad. No es una probabilidad calculada ni una cuota.
          </div>
        </>
      )}
    </div>
  )
}
