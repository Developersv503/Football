import Link from 'next/link'
import { ScorePredictionForm } from './ScorePredictionForm'
import type { MatchContest, ScorePredictionLeaderboardRow, ScorePredictionRow } from '@/lib/api'

export function MatchContestCard({
  contest,
  eventId,
  homeTeam,
  awayTeam,
  isLoggedIn,
  isOpenForPredictions,
  myPrediction,
  leaderboard,
}: {
  contest: MatchContest
  eventId: string
  homeTeam: string
  awayTeam: string
  isLoggedIn: boolean
  isOpenForPredictions: boolean
  myPrediction: ScorePredictionRow | null
  leaderboard: ScorePredictionLeaderboardRow[]
}) {
  const topTiers = contest.rewardTiers.slice(0, 3)

  return (
    <div className="detail-card contest-card">
      <div className="contest-head">
        <div className="detail-card-title">Marcador exacto — ganá puntos</div>
        {contest.rewardTiers.length > 0 ? (
          <div className="contest-tiers">
            {topTiers.map((t) => (
              <span key={t.rank} className="contest-tier-chip">
                {t.rank}° <b>{t.points}</b> pts
              </span>
            ))}
            {contest.rewardTiers.length > topTiers.length ? (
              <span className="contest-tier-more">+{contest.rewardTiers.length - topTiers.length} puestos</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {contest.recommendedHomeScore != null && contest.recommendedAwayScore != null ? (
        <div className="contest-recommended">
          Pronóstico recomendado: <b className="tnum">{contest.recommendedHomeScore} – {contest.recommendedAwayScore}</b>
        </div>
      ) : null}

      {isOpenForPredictions ? (
        isLoggedIn ? (
          myPrediction ? (
            <div className="contest-my-pred">
              Tu marcador: <b className="tnum">{myPrediction.homeScore} – {myPrediction.awayScore}</b>
              <span className="contest-my-pred-note">Enviado — el orden lo define quién acertó primero.</span>
            </div>
          ) : (
            <ScorePredictionForm eventId={eventId} homeTeam={homeTeam} awayTeam={awayTeam} />
          )
        ) : (
          <Link href="/login" className="btn-predict">
            Iniciá sesión para pronosticar
          </Link>
        )
      ) : (
        <div className="detail-empty">
          {contest.status === 'SETTLED' ? 'Concurso liquidado.' : 'Ya no admite pronósticos.'}
        </div>
      )}

      {leaderboard.length > 0 ? (
        <div className="contest-leaderboard">
          <div className="rail-eyebrow">Acertaron el marcador exacto</div>
          <div className="rank-list">
            {leaderboard.map((row) => (
              <div className="rank-row" key={row.id}>
                <span className="rank-num tnum">{row.rank}</span>
                <div className="rank-avatar">{row.user.displayName.slice(0, 2).toUpperCase()}</div>
                <span className="rank-name">{row.user.displayName}</span>
                <span className="rank-acc tnum">+{row.pointsAwarded} pts</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
