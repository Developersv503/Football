import type { RankingRow, TournamentCard } from '@/lib/api'
import { accuracyPct, centsToMoney, initials, timeUntil } from '@/lib/format'
import { JoinTournamentButton } from './JoinTournamentButton'

function TournamentRailCard({
  tournament,
  entryCount,
  isLoggedIn,
}: {
  tournament: TournamentCard | null
  entryCount: number
  isLoggedIn: boolean
}) {
  if (!tournament) return null

  return (
    <div className="rail-card tournament-card">
      <div className="rail-eyebrow">Torneo destacado</div>
      <div className="rail-title">{tournament.name}</div>
      <div className="prize tnum">{centsToMoney(tournament.prizePoolCents)}</div>
      <div className="prize-sub">Pool de premios de hoy</div>
      <div className="t-meta">
        <span>Participantes</span>
        <b className="tnum">{entryCount}</b>
      </div>
      <div className="t-meta">
        <span>Entrada</span>
        <b className="tnum">{centsToMoney(tournament.entryFeeCents)}</b>
      </div>
      <div className="t-meta">
        <span>Cierra en</span>
        <b className="tnum">{timeUntil(tournament.endAt)}</b>
      </div>
      <JoinTournamentButton tournamentId={tournament.id} isLoggedIn={isLoggedIn} />
    </div>
  )
}

function RankingRailCard({ ranking }: { ranking: RankingRow[] }) {
  if (ranking.length === 0) return null

  return (
    <div className="rail-card">
      <div className="rail-eyebrow">Ranking global</div>
      <div className="rail-title">Top pronosticadores</div>
      <div className="rank-list">
        {ranking.map((row, i) => (
          <div className="rank-row" key={row.userId}>
            <div className="rank-num">{i + 1}</div>
            <div className="rank-avatar">{initials(row.user.displayName)}</div>
            <div className="rank-name">{row.user.displayName}</div>
            <div className="rank-acc tnum">{accuracyPct(row.accuracyBasisPoints)}</div>
          </div>
        ))}
      </div>
      <a className="rail-link" href="/pronosticadores">
        Ver ranking completo →
      </a>
    </div>
  )
}

export function Rail({
  tournament,
  entryCount,
  ranking,
  isLoggedIn,
}: {
  tournament: TournamentCard | null
  entryCount: number
  ranking: RankingRow[]
  isLoggedIn: boolean
}) {
  return (
    <div className="rail">
      <TournamentRailCard tournament={tournament} entryCount={entryCount} isLoggedIn={isLoggedIn} />
      <RankingRailCard ranking={ranking} />
      <div className="rail-card promo-card">
        <div className="rail-eyebrow">Bonificación</div>
        <div className="rail-title">Primer pronóstico gratis</div>
        <p>Registrate hoy y participá en tu primer torneo diario sin costo de entrada.</p>
      </div>
    </div>
  )
}
