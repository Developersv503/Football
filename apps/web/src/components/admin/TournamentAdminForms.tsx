'use client'

import { useActionState, useState } from 'react'
import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Tag } from 'antd'
import { adminCreateTournamentAction, adminUpdateTournamentStatusAction, type ActionResult } from '@/lib/admin-actions'
import type { TournamentCard } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

const NEXT_STATUS: Record<TournamentCard['status'], TournamentCard['status'] | null> = {
  UPCOMING: 'ACTIVE',
  ACTIVE: 'CLOSED',
  CLOSED: 'SETTLED',
  SETTLED: null,
}

export function CreateTournamentForm() {
  const [state, formAction, pending] = useActionState(adminCreateTournamentAction, initialState)
  const [type, setType] = useState<TournamentCard['type']>('DAILY')

  return (
    <Form action={formAction} layout="vertical" requiredMark={false}>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item label="Nombre" required>
            <Input name="name" required maxLength={120} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Tipo">
            <Select
              value={type}
              onChange={setType}
              options={[
                { value: 'DAILY', label: 'Diario' },
                { value: 'MONTHLY', label: 'Mensual' },
                { value: 'CUSTOM', label: 'Personalizado' },
              ]}
            />
            <input type="hidden" name="type" value={type} readOnly />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item label="Inicio" required>
            <Input type="datetime-local" name="startAt" required />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Fin" required>
            <Input type="datetime-local" name="endAt" required />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item label="Entrada (centavos)">
            <InputNumber name="entryFeeCents" min={0} defaultValue={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Pozo (centavos)">
            <InputNumber name="prizePoolCents" min={0} defaultValue={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      {state.error ? <Alert type="error" message={state.error} showIcon style={{ marginBottom: 12 }} /> : null}
      {state.ok ? <Alert type="success" message="Torneo creado" showIcon style={{ marginBottom: 12 }} /> : null}
      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={pending}>
        Crear torneo
      </Button>
    </Form>
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
