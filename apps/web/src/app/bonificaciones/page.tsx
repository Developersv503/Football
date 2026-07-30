import { Sidebar } from '@/components/Sidebar'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

export default async function BonificacionesPage() {
  const { viewer } = await getViewer()

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="bonificaciones" />

      <main>
        <div className="topbar">
          <div className="topbar-head">
            <div>
              <div className="page-title">Bonificaciones</div>
              <div className="page-sub">Programa de bonos por registro y actividad.</div>
            </div>
          </div>
        </div>

        <div className="empty-state">
          Todavía no hay bonos configurados en la plataforma — esta sección se activa cuando se defina el
          programa de bonificaciones.
        </div>
      </main>
    </div>
  )
}
