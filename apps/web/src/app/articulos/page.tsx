import { Sidebar } from '@/components/Sidebar'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

export default async function ArticulosPage() {
  const { viewer } = await getViewer()

  return (
    <div className="shell">
      <Sidebar eventsToday={0} user={viewer} active="articulos" />

      <main>
        <div className="topbar">
          <div className="topbar-head">
            <div>
              <div className="page-title">Artículos</div>
              <div className="page-sub">Notas y análisis de la comunidad de pronosticadores.</div>
            </div>
          </div>
        </div>

        <div className="empty-state">Todavía no hay artículos publicados — esta sección llega con el módulo de contenido.</div>
      </main>
    </div>
  )
}
