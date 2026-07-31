'use client'

import { CalendarOutlined, CrownOutlined, DollarCircleOutlined, FireOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic } from 'antd'
import type { AdminDashboard } from '@/lib/api'

export function DashboardStats({ stats }: { stats: AdminDashboard }) {
  const cards = [
    {
      label: 'Exposición en puntos',
      value: stats.pointsLiability,
      sub: 'Lo que se le debe a los usuarios si todos canjean',
      icon: <DollarCircleOutlined />,
      color: '#F5A623',
    },
    {
      label: 'Canjes pendientes',
      value: stats.pendingRedemptions.count,
      sub: `${stats.pendingRedemptions.points} pts en cola`,
      icon: <FireOutlined />,
      color: '#E14B4B',
    },
    { label: 'Usuarios', value: stats.totalUsers, sub: `${stats.activeUsers} activos`, icon: <TeamOutlined />, color: '#B98CFF' },
    {
      label: 'Pronósticos hoy',
      value: stats.predictionsToday + stats.scorePredictionsToday,
      sub: `${stats.scorePredictionsToday} de marcador exacto`,
      icon: <CalendarOutlined />,
      color: '#4CC9F0',
    },
    { label: 'Torneos activos', value: stats.activeTournaments, sub: null, icon: <CrownOutlined />, color: '#FF9F5A' },
    { label: 'Concursos abiertos', value: stats.openMatchContests, sub: null, icon: <TrophyOutlined />, color: '#34B378' },
  ]

  return (
    <Row gutter={[16, 16]}>
      {cards.map((c) => (
        <Col xs={12} md={8} key={c.label}>
          <Card size="small" className="admin-stat-card-antd">
            <div className="admin-stat-icon" style={{ background: `color-mix(in srgb, ${c.color} 16%, transparent)`, color: c.color }}>
              {c.icon}
            </div>
            <Statistic
              title={<span style={{ color: 'var(--adm-text-faint)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</span>}
              value={c.value}
              valueStyle={{ fontFamily: 'Plex Mono, monospace', fontWeight: 600, fontSize: 24, color: 'var(--adm-text)' }}
            />
            {c.sub ? <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginTop: 4 }}>{c.sub}</div> : null}
          </Card>
        </Col>
      ))}
    </Row>
  )
}
