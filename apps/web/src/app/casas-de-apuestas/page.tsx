import { Sidebar } from '@/components/Sidebar'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

export default async function CasasDeApuestasPage() {
  const { viewer } = await getViewer()

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="casas" />

      <main>
        <div className="topbar">
          <div className="topbar-head">
            <div>
              <div className="page-title">Casas de apuestas</div>
              <div className="page-sub">Cuotas de referencia de terceros — solo informativo.</div>
            </div>
          </div>
        </div>

        <div className="empty-state">
          El plan actual de Sportradar (trial) no incluye el producto de cuotas — por eso los partidos muestran
          &quot;Cuotas: N/D&quot; en vez de datos inventados. Esta sección se completa al activar el paquete Odds.
        </div>
      </main>
    </div>
  )
}
