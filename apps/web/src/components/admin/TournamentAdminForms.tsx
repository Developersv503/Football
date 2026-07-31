'use client'

import { useActionState, useState } from 'react'
import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Col, Input, InputNumber, Row, Select, Tag } from 'antd'
import { adminCreateTournamentAction, adminUpdateTournamentStatusAction, type ActionResult } from '@/lib/admin-actions'
import type { TournamentCard } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

const NEXT_STATUS: Record<TournamentCard['status'], TournamentCard['status'] | null> = {
  UPCOMING: 'ACTIVE',
  ACTIVE: 'CLOSED',
  CLOSED: 'SETTLED',
  SETTLED: null,
}

// form nativo (no antd Form): antd Form intercepta el submit y evita que la
// server action de React 19 (action={formAction}) se dispare.
export function CreateTournamentForm() {
  const [state, formAction, pending] = useActionState(adminCreateTournamentAction, initialState)
  const [type, setType] = useState<TournamentCard['type']>('DAILY')

  return (
    <form action={formAction}>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <div className="admin-field-label">Nombre</div>
          <Input name="name" required maxLength={120} style={{ marginBottom: 14 }} />
        </Col>
        <Col xs={24} sm={12}>
          <div className="admin-field-label">Tipo</div>
          <Select
            value={type}
            onChange={setType}
            style={{ width: '100%', marginBottom: 14 }}
            options={[
              { value: 'DAILY', label: 'Diario' },
              { value: 'MONTHLY', label: 'Mensual' },
              { value: 'CUSTOM', label: 'Personalizado' },
            ]}
          />
          <input type="hidden" name="type" value={type} readOnly />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <div className="admin-field-label">Inicio</div>
          <Input type="datetime-local" name="startAt" required style={{ marginBottom: 14 }} />
        </Col>
        <Col xs={24} sm={12}>
          <div className="admin-field-label">Fin</div>
          <Input type="datetime-local" name="endAt" required style={{ marginBottom: 14 }} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <div className="admin-field-label">Entrada (centavos)</div>
          <InputNumber name="entryFeeCents" min={0} defaultValue={0} style={{ width: '100%', marginBottom: 14 }} />
        </Col>
        <Col xs={24} sm={12}>
          <div className="admin-field-label">Pozo (centavos)</div>
          <InputNumber name="prizePoolCents" min={0} defaultValue={0} style={{ width: '100%', marginBottom: 14 }} />
        </Col>
      </Row>
      {state.error ? <Alert type="error" message={state.error} showIcon style={{ marginBottom: 12 }} /> : null}
      {state.ok ? <Alert type="success" message="Torneo creado" showIcon style={{ marginBottom: 12 }} /> : null}
      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={pending}>
        Crear torneo
      </Button>
    </form>
  )
}

export function TournamentStatusButton({ tournament }: { tournament: TournamentCard }) {
  const [state, formAction, pending] = useActionState(adminUpdateTournamentStatusAction, initialState)
  const next = NEXT_STATUS[tournament.status]

  if (!next) return <Tag>Cerrado</Tag>

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={tournament.id} />
      <input type="hidden" name="status" value={next} />
      <Button size="small" icon={<ArrowRightOutlined />} htmlType="submit" loading={pending}>
        {next}
      </Button>
      {state.error ? <Alert type="error" message={state.error} showIcon banner style={{ marginTop: 6 }} /> : null}
    </form>
  )
}
