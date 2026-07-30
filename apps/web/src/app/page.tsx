import { Sidebar } from '@/components/Sidebar'
import { MatchList } from '@/components/MatchList'
import { Rail } from '@/components/Rail'
import { getActiveTournament, getGlobalRanking, getLiveEvents, getMyProfile, getTodayEvents, getTournamentLeaderboard } from '@/lib/api'
import { getSession } from '@/lib/session'

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

export default async function HomePage() {
  const session = await getSession()

  // Tres fetches independientes — Promise.all en vez de await secuencial
  // evita una cascada de 3 round-trips a la API.
  const [eventsPage, livePage, tournamentPage, ranking] = await Promise.all([
    getTodayEvents(),
    getLiveEvents(),
    getActiveTournament(),
    getGlobalRanking(5),
  ])

  const tournament = tournamentPage.items[0] ?? null
  const entries = tournament ? await getTournamentLeaderboard(tournament.id) : null

  // El JWT no lleva displayName — se resuelve con el perfil real. Si el
  // token quedó viejo/inválido, se trata como invitado en vez de romper la página.
  const user = session
    ? await getMyProfile(session.token)
        .then((profile) => ({ displayName: profile.user.displayName, email: session.user.email }))
        .catch(() => ({ displayName: session.user.email, email: session.user.email }))
    : null

  // En vivo primero, sin duplicar los que ya venían en el listado general.
  const seenIds = new Set(livePage.items.map((e) => e.id))
  const events = [...livePage.items, ...eventsPage.items.filter((e) => !seenIds.has(e.id))]
  const liveCount = livePage.items.length

  return (
    <div className="shell">
      <Sidebar eventsToday={events.length} user={user} />

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
        </div>

        <div className="content-grid">
          <MatchList events={events} isLoggedIn={Boolean(user)} />
          <Rail tournament={tournament} entryCount={entries?.items.length ?? 0} ranking={ranking.items} isLoggedIn={Boolean(user)} />
        </div>
      </main>
    </div>
  )
}
