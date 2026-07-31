'use client'

import { Card, Space, Tag } from 'antd'
import type { EventCard, MatchContest } from '@/lib/api'
import { ContestConfigForm } from './ContestConfigForm'

export function ContestsList({ events, contests }: { events: EventCard[]; contests: (MatchContest | null)[] }) {
  if (events.length === 0) {
    return (
      <Card size="small" className="admin-empty">
        No hay partidos hoy.
      </Card>
    )
  }

  return (
    <Space direction="vertical" size={12} style={{ display: 'flex' }}>
      {events.map((event, i) => (
        <Card
          size="small"
          key={event.id}
          title={
            <span>
              {event.homeTeam} vs {event.awayTeam} <Tag style={{ marginLeft: 8 }}>{event.competition.name}</Tag>
            </span>
          }
        >
          <ContestConfigForm event={event} contest={contests[i]} />
        </Card>
      ))}
    </Space>
  )
}
