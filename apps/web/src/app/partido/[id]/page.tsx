import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { PredictButtons } from '@/components/PredictButtons'
import { Consensus } from '@/components/Consensus'
import { Lineups } from '@/components/Lineups'
import { getMatchDetail } from '@/lib/api'
import { competitionColor, initials, kickoffTime, statusLabel } from '@/lib/format'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { viewer } = await getViewer()

  const match = await getMatchDetail(id).catch(() => null)
  if (!match) notFound()

  const isLive = match.status === 'LIVE'
  const kickoff = new Date(match.startTime).toLocaleString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="matches" />

      <main>
        <div className="topbar">
          <Link className="back-link" href="/">
            ← Volver a partidos
          </Link>
          <div className="topbar-head">
            <div>
              <div className="page-title">
                {match.homeTeam} vs {match.awayTeam}
              </div>
              <div className="page-sub">
                {match.competition.name}
                {match.competition.country ? ` · ${match.competition.country}` : ''} · {kickoff} UTC
              </div>
            </div>
            {isLive ? (
              <div className="live-indicator">
                <span className="live-dot" /> En vivo
              </div>
            ) : (
              <span className="status-chip">{statusLabel(match.status)}</span>
            )}
          </div>
        </div>

        <div className="match-detail">
          <div className="scoreboard">
            <div className="sb-team">
              <div className="sb-crest" style={{ background: competitionColor(match.homeTeam) }}>
                {initials(match.homeTeam)}
              </div>
              <div className="sb-name">{match.homeTeam}</div>
            </div>
            <div className="sb-score tnum">
              {match.homeScore != null && match.awayScore != null
                ? `${match.homeScore} – ${match.awayScore}`
                : kickoffTime(match.startTime)}
            </div>
            <div className="sb-team">
              <div className="sb-crest" style={{ background: competitionColor(match.awayTeam) }}>
                {initials(match.awayTeam)}
              </div>
              <div className="sb-name">{match.awayTeam}</div>
            </div>
          </div>

          {match.status === 'SCHEDULED' ? (
            <div className="detail-card detail-predict">
              <div className="detail-card-title">Tu pronóstico</div>
              <PredictButtons eventId={match.id} isLoggedIn={Boolean(viewer)} />
            </div>
          ) : null}

          <Consensus
            consensus={match.consensus}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />

          <Lineups lineups={match.lineups} status={match.status} />
        </div>
      </main>
    </div>
  )
}
