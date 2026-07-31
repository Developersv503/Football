'use client'

import { useActionState } from 'react'
import { SaveOutlined } from '@ant-design/icons'
import { Alert, Button, Col, Input, InputNumber, Row } from 'antd'
import { adminSetRoundConfigAction, type ActionResult } from '@/lib/admin-actions'
import type { RoundConfig } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

// form nativo (no antd Form): antd Form intercepta el submit y evita que la
// server action de React 19 (action={formAction}) se dispare.
export function RoundConfigForm({ config }: { config: RoundConfig }) {
  const [state, formAction, pending] = useActionState(adminSetRoundConfigAction, initialState)

  return (
    <form action={formAction}>
      <div className="admin-field-label">Etiqueta de la jornada</div>
      <Input name="roundLabel" defaultValue={config.roundLabel} maxLength={80} style={{ marginBottom: 14 }} />
      <Row gutter={12}>
        <Col xs={24} sm={8}>
          <div className="admin-field-label">Meta de puntos de la jornada</div>
          <InputNumber name="targetPoints" min={0} defaultValue={config.targetPoints} style={{ width: '100%', marginBottom: 14 }} />
        </Col>
        <Col xs={24} sm={8}>
          <div className="admin-field-label">Moneda</div>
          <Input name="currency" defaultValue={config.currency} maxLength={10} style={{ marginBottom: 14 }} />
        </Col>
        <Col xs={24} sm={8}>
          <div className="admin-field-label">Puntos por unidad de moneda</div>
          <InputNumber
            name="pointsPerCurrencyUnit"
            min={1}
            defaultValue={config.pointsPerCurrencyUnit}
            style={{ width: '100%', marginBottom: 14 }}
          />
        </Col>
      </Row>
      {state.error ? <Alert type="error" message={state.error} showIcon style={{ marginBottom: 12 }} /> : null}
      {state.ok ? <Alert type="success" message="Guardado" showIcon style={{ marginBottom: 12 }} /> : null}
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={pending}>
        {pending ? 'Guardando…' : 'Guardar'}
      </Button>
    </form>
  )
}
