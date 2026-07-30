import Link from 'next/link'
import type { EventCard } from '@/lib/api'
import { competitionColor, initials, kickoffTime, statusLabel } from '@/lib/format'
import { PredictButtons } from './PredictButtons'

function MatchCard({ event, isLoggedIn }: { event: EventCard; isLoggedIn: boolean }) {
  const isLive = event.status === 'LIVE'
  const isFinished = event.status === 'FINISHED'
  const homeWon = isFinished && event.homeScore != null && event.awayScore != null && event.homeScore > event.awayScore
  const awayWon = isFinished && event.homeScore != null && event.awayScore != null && event.awayScore > event.homeScore

  return (
    <div className={`match-card${isLive ? ' is-live' : ''}`}>
      <div className="kickoff">
        {isLive ? (
          <span className="status-chip live">
            <span className="live-dot" />
            En vivo
          </span>
        ) : (
          <>
            <b className="tnum">{kickoffTime(event.startTime)}</b>
            <span className={`status-chip${isFinished ? ' finished' : ''}`}>{statusLabel(event.status)}</span>
          </>
        )}
      </div>

      <Link className="teams" href={`/partido/${event.id}`}>
        <div className={`team-row${homeWon ? ' winner' : ''}`}>
          <div className="crest" style={{ background: competitionColor(event.homeTeam) }}>
            {initials(event.homeTeam)}
          </div>
          <div className="team-name">{event.homeTeam}</div>
          {event.homeScore != null ? <div className="team-score tnum">{event.homeScore}</div> : null}
        </div>
        <div className={`team-row${awayWon ? ' winner' : ''}`}>
          <div className="crest" style={{ background: competitionColor(event.awayTeam) }}>
            {initials(event.awayTeam)}
          </div>
          <div className="team-name">{event.awayTeam}</div>
          {event.awayScore != null ? <div className="team-score tnum">{event.awayScore}</div> : null}
        </div>
      </Link>

      <div className="action-block">
        <div className="pred-count">
          🔥 <b className="tnum">{event.predictionsCount}</b> pronósticos
        </div>
        {event.status === 'SCHEDULED' ? (
          <PredictButtons eventId={event.id} isLoggedIn={isLoggedIn} />
        ) : (
          <span className="odds-na">Cuotas: N/D (trial)</span>
        )}
      </div>
    </div>
  )
}

export function MatchList({ events, isLoggedIn }: { events: EventCard[]; isLoggedIn: boolean }) {
  if (events.length === 0) {
    return <div className="empty-state">No hay partidos sincronizados todavía.</div>
  }

  const byCompetition = new Map<string, { name: string; events: EventCard[] }>()
  for (const event of events) {
    const key = event.competition.id
    if (!byCompetition.has(key)) byCompetition.set(key, { name: event.competition.name, events: [] })
    byCompetition.get(key)!.events.push(event)
  }

  return (
    <div className="matches-col">
      {[...byCompetition.entries()].map(([id, group]) => (
        <div className="comp-group" key={id}>
          <div className="comp-head">
            <div className="comp-flag" style={{ background: competitionColor(group.name) }} />
            <span className="comp-name">{group.name}</span>
            <span className="comp-count tnum">· {group.events.length} partidos</span>
            <div className="comp-line" />
          </div>
          <div className="match-list">
            {group.events.map((event) => (
              <MatchCard event={event} isLoggedIn={isLoggedIn} key={event.id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
