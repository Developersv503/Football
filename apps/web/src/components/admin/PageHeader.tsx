'use client'

import { CrownOutlined, SettingOutlined, TrophyOutlined } from '@ant-design/icons'
import { Typography } from 'antd'

const ICONS = {
  torneos: { icon: <CrownOutlined />, color: '#FF9F5A' },
  concursos: { icon: <TrophyOutlined />, color: '#F5A623' },
  config: { icon: <SettingOutlined />, color: '#7A8AA0' },
} as const

export function PageHeader({
  iconKey,
  title,
  subtitle,
}: {
  iconKey?: keyof typeof ICONS
  title: string
  subtitle: string
}) {
  const preset = iconKey ? ICONS[iconKey] : null

  return (
    <div>
      <Typography.Title level={3} style={{ margin: 0, color: 'var(--adm-text)' }}>
        {preset ? <span style={{ color: preset.color, marginRight: 10 }}>{preset.icon}</span> : null}
        {title}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: 12.5 }}>
        {subtitle}
      </Typography.Text>
    </div>
  )
}
