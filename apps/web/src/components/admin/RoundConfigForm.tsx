'use client'

import { useActionState } from 'react'
import { SaveOutlined } from '@ant-design/icons'
import { Alert, Button, Col, Form, Input, InputNumber, Row } from 'antd'
import { adminSetRoundConfigAction, type ActionResult } from '@/lib/admin-actions'
import type { RoundConfig } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

export function RoundConfigForm({ config }: { config: RoundConfig }) {
  const [state, formAction, pending] = useActionState(adminSetRoundConfigAction, initialState)

  return (
    <Form action={formAction} layout="vertical" requiredMark={false}>
      <Form.Item label="Etiqueta de la jornada">
        <Input name="roundLabel" defaultValue={config.roundLabel} maxLength={80} />
      </Form.Item>
      <Row gutter={12}>
        <Col xs={24} sm={8}>
          <Form.Item label="Meta de puntos de la jornada">
            <InputNumber name="targetPoints" min={0} defaultValue={config.targetPoints} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Moneda">
            <Input name="currency" defaultValue={config.currency} maxLength={10} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Puntos por unidad de moneda">
            <InputNumber name="pointsPerCurrencyUnit" min={1} defaultValue={config.pointsPerCurrencyUnit} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      {state.error ? <Alert type="error" message={state.error} showIcon style={{ marginBottom: 12 }} /> : null}
      {state.ok ? <Alert type="success" message="Guardado" showIcon style={{ marginBottom: 12 }} /> : null}
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={pending}>
        {pending ? 'Guardando…' : 'Guardar'}
      </Button>
    </Form>
  )
}
