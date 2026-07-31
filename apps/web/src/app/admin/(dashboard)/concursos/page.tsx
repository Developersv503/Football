import { ContestConfigForm } from '@/components/admin/ContestConfigForm'
import { getMatchContest, getTodayEvents } from '@/lib/api'

export default async function AdminContestsPage() {
  const eventsPage = await getTodayEvents()
  const contests = await Promise.all(eventsPage.items.map((e) => getMatchContest(e.id)))

  return (
    <>
      <div>
        <div className="admin-page-title">Concursos de marcador exacto</div>
        <div className="admin-page-sub">Partidos de hoy — activá el concurso, fijá el recomendado y los tramos de puntos.</div>
      </div>

      {eventsPage.items.length === 0 ? (
        <div className="admin-card admin-empty">No hay partidos hoy.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {eventsPage.items.map((event, i) => (
            <div className="admin-card" key={event.id}>
              <div className="admin-card-title">
                {event.homeTeam} vs {event.awayTeam} <span className="admin-pill muted">{event.competition.name}</span>
              </div>
              <ContestConfigForm event={event} contest={contests[i]} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
