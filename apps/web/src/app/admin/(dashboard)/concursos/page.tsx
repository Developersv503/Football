import { ContestsList } from '@/components/admin/ContestsList'
import { PageHeader } from '@/components/admin/PageHeader'
import { getMatchContest, getTodayEvents } from '@/lib/api'

export default async function AdminContestsPage() {
  const eventsPage = await getTodayEvents()
  const contests = await Promise.all(eventsPage.items.map((e) => getMatchContest(e.id)))

  return (
    <>
      <PageHeader
        iconKey="concursos"
        title="Concursos de marcador exacto"
        subtitle="Partidos de hoy — activá el concurso, fijá el recomendado y los tramos de puntos."
      />
      <ContestsList events={eventsPage.items} contests={contests} />
    </>
  )
}
