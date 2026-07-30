import { Sidebar } from '@/components/Sidebar'
import { MatchList } from '@/components/MatchList'
import { Rail } from '@/components/Rail'
import { LeagueFilter } from '@/components/LeagueFilter'
import {
  getActiveTournament,
  getCompetitions,
  getGlobalRanking,
  getLiveEvents,
  getTodayEvents,
  getTournamentLeaderboard,
} from '@/lib/api'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

const SPORT_TABS = [
  { emoji: '⚽', label: 'Fútbol', active: true },
  { emoji: '🏒', label: 'Hockey', active: false },
  { emoji: '🎾', label: 'Tenis', active: false },
  { emoji: '🏀', label: 'Básket', active: false },
  { emoji: '🎮', label: 'CS2', active: false },
  { emoji: '🎮', label: 'Dota 2', active: false },
  { emoji: '🥊', label: 'Boxeo', active: false },
  { emoji: '🥋', label: 'MMA', active: false },
]

const TODAY_LABEL = new Date().toLocaleDateString('es-AR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  timeZone: 'UTC',
})

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ liga?: string }>
}) {
  const { liga } = await searchParams
  const { viewer: user } = await getViewer()

  // Fetches independientes — Promise.all en vez de await secuencial evita
  // una cascada de round-trips a la API.
  const [eventsPage, livePage, tournamentPage, ranking, competitions] = await Promise.all([
    getTodayEvents(liga),
    getLiveEvents(),
    getActiveTournament(),
    getGlobalRanking(5),
    getCompetitions(),
  ])

  const tournament = tournamentPage.items[0] ?? null
  const entries = tournament ? await getTournamentLeaderboard(tournament.id) : null

  // En vivo primero, sin duplicar los que ya venían en el listado general.
  // Con una liga elegida, los "en vivo" también se acotan a esa liga — si no,
  // el filtro dejaría colarse partidos de otras competiciones.
  const liveItems = liga
    ? livePage.items.filter((e) => e.competition.id === liga)
    : livePage.items
  const seenIds = new Set(liveItems.map((e) => e.id))
  const events = [...liveItems, ...eventsPage.items.filter((e) => !seenIds.has(e.id))]
  const liveCount = liveItems.length

  return (
    <div className="shell">
      <Sidebar eventsToday={events.length} user={user} active="matches" />

      <main>
        <div className="topbar">
          <div className="topbar-head">
            <div>
              <div className="page-title">Partidos de hoy</div>
              <div className="page-sub">
                {TODAY_LABEL} · {events.length} eventos · datos reales (Sportradar trial) · cuotas no disponibles en este plan
              </div>
            </div>
            {liveCount > 0 ? (
              <div className="live-indicator">
                <span className="live-dot" /> {liveCount} en vivo ahora
              </div>
            ) : null}
          </div>

          <div className="sport-tabs">
            {SPORT_TABS.map((tab) => (
              <div className={`sport-tab${tab.active ? ' active' : ' disabled'}`} key={tab.label}>
                {tab.emoji} {tab.label}
                {!tab.active ? <span className="tag">Próx.</span> : null}
              </div>
            ))}
          </div>

          <LeagueFilter competitions={competitions} selected={liga ?? null} />
        </div>

        <div className="content-grid">
          <MatchList events={events} isLoggedIn={Boolean(user)} />
          <Rail tournament={tournament} entryCount={entries?.items.length ?? 0} ranking={ranking.items} isLoggedIn={Boolean(user)} />
        </div>
      </main>
    </div>
  )
}
