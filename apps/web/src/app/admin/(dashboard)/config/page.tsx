import { AdminCard } from '@/components/admin/AdminCard'
import { PageHeader } from '@/components/admin/PageHeader'
import { RoundConfigForm } from '@/components/admin/RoundConfigForm'
import { getRoundConfig } from '@/lib/api'

export default async function AdminConfigPage() {
  const config = await getRoundConfig()

  return (
    <>
      <PageHeader
        iconKey="config"
        title="Configuración"
        subtitle="Meta de puntos de la jornada y tasa de conversión a dinero real."
      />
      <AdminCard>
        <RoundConfigForm config={config} />
      </AdminCard>
    </>
  )
}
