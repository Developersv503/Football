'use client'

import { useActionState, useState } from 'react'
import { CheckCircleOutlined, PlayCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Alert, Button, Col, Input, InputNumber, Row, Space, Tag } from 'antd'
import {
  adminEnsureContestAction,
  adminSetRecommendedAction,
  adminSetRewardTiersAction,
  adminSettleContestAction,
  type ActionResult,
} from '@/lib/admin-actions'
import type { EventCard, MatchContest } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

function tiersToText(tiers: { rank: number; points: number }[]): string {
  return tiers.map((t) => `${t.rank}:${t.points}`).join(', ')
}

const STATUS_COLOR: Record<string, string> = { OPEN: 'green', LOCKED: 'gold', SETTLED: 'default' }

export function ContestConfigForm({ event, contest }: { event: EventCard; contest: MatchContest | null }) {
  const [ensureState, ensureAction, ensurePending] = useActionState(adminEnsureContestAction, initialState)
  const [recState, recAction, recPending] = useActionState(adminSetRecommendedAction, initialState)
  const [tiersState, tiersAction, tiersPending] = useActionState(adminSetRewardTiersAction, initialState)
  const [settleState, settleAction, settlePending] = useActionState(adminSettleContestAction, initialState)
  const [open, setOpen] = useState(false)

  if (!contest && !open) {
    return (
      <form action={ensureAction}>
        <input type="hidden" name="eventId" value={event.id} />
        <Button type="primary" icon={<PlayCircleOutlined />} htmlType="submit" loading={ensurePending} onClick={() => setOpen(true)}>
          Activar concurso
        </Button>
        {ensureState.error ? <Alert type="error" message={ensureState.error} showIcon style={{ marginTop: 10 }} /> : null}
      </form>
    )
  }

  return (
    <Row gutter={[16, 12]} align="top" wrap>
      <Col xs={24} sm={8}>
        <form action={recAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <div className="admin-field-label">Recomendado (local-visita)</div>
          <Space size={6}>
            <InputNumber name="homeScore" min={0} defaultValue={contest?.recommendedHomeScore ?? 0} style={{ width: 68 }} />
            <InputNumber name="awayScore" min={0} defaultValue={contest?.recommendedAwayScore ?? 0} style={{ width: 68 }} />
            <Button size="small" htmlType="submit" loading={recPending}>
              Guardar
            </Button>
          </Space>
          {recState.error ? <Alert type="error" message={recState.error} showIcon banner style={{ marginTop: 6 }} /> : null}
        </form>
      </Col>

      <Col xs={24} sm={10}>
        <form action={tiersAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <div className="admin-field-label">Tramos de puntos (rank:puntos)</div>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              name="tiers"
              placeholder="1:1200, 2:1000, 3:500"
              defaultValue={contest ? tiersToText(contest.rewardTiers) : ''}
            />
            <Button icon={<ThunderboltOutlined />} htmlType="submit" loading={tiersPending}>
              Guardar
            </Button>
          </Space.Compact>
          {tiersState.error ? <Alert type="error" message={tiersState.error} showIcon banner style={{ marginTop: 6 }} /> : null}
        </form>
      </Col>

      <Col xs={24} sm={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <Tag color={STATUS_COLOR[contest?.status ?? 'OPEN']}>{contest?.status ?? 'OPEN'}</Tag>
        {event.status === 'FINISHED' && contest?.status !== 'SETTLED' ? (
          <form action={settleAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} htmlType="submit" loading={settlePending}>
              Liquidar ahora
            </Button>
          </form>
        ) : null}
        {settleState.ok ? <Alert type="success" message="Liquidado" showIcon banner /> : null}
        {settleState.error ? <Alert type="error" message={settleState.error} showIcon banner /> : null}
      </Col>
    </Row>
  )
}
