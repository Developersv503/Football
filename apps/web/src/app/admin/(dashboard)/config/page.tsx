import { RoundConfigForm } from '@/components/admin/RoundConfigForm'
import { getRoundConfig } from '@/lib/api'

export default async function AdminConfigPage() {
  const config = await getRoundConfig()

  return (
    <>
      <div>
        <div className="admin-page-title">Configuración</div>
        <div className="admin-page-sub">Meta de puntos de la jornada y tasa de conversión a dinero real.</div>
      </div>

      <div className="admin-card">
        <RoundConfigForm config={config} />
      </div>
    </>
  )
}
