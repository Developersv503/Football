import { AdminCard } from '@/components/admin/AdminCard'
import { PageHeader } from '@/components/admin/PageHeader'
import { CreateTournamentForm } from '@/components/admin/TournamentAdminForms'
import { TournamentsTable } from '@/components/admin/TournamentsTable'
import { getTournaments } from '@/lib/api'

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments()

  return (
    <>
      <PageHeader iconKey="torneos" title="Torneos" subtitle="Crear torneos y avanzar su estado manualmente." />

      <AdminCard title="Nuevo torneo">
        <CreateTournamentForm />
      </AdminCard>

      <AdminCard title="Torneos existentes">
        {tournaments.items.length === 0 ? (
          <div className="admin-empty">Sin torneos todavía.</div>
        ) : (
          <TournamentsTable tournaments={tournaments.items} />
        )}
      </AdminCard>
    </>
  )
}
