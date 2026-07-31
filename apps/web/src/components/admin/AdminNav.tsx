'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CrownOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'

const ITEMS = [
  { key: '/admin', label: 'Dashboard', icon: <DashboardOutlined style={{ color: '#4CC9F0' }} /> },
  { key: '/admin/concursos', label: 'Concursos', icon: <TrophyOutlined style={{ color: '#F5A623' }} /> },
  { key: '/admin/canjes', label: 'Canjes', icon: <DollarCircleOutlined style={{ color: '#34B378' }} /> },
  { key: '/admin/usuarios', label: 'Usuarios', icon: <TeamOutlined style={{ color: '#B98CFF' }} /> },
  { key: '/admin/torneos', label: 'Torneos', icon: <CrownOutlined style={{ color: '#FF9F5A' }} /> },
  { key: '/admin/config', label: 'Config', icon: <SettingOutlined style={{ color: '#7A8AA0' }} /> },
]

export function AdminNav({ mode = 'inline' }: { mode?: 'inline' | 'horizontal' }) {
  const pathname = usePathname()
  const active = ITEMS.slice().sort((a, b) => b.key.length - a.key.length).find((item) =>
    item.key === '/admin' ? pathname === '/admin' : pathname.startsWith(item.key),
  )

  return (
    <Menu
      mode={mode}
      theme="dark"
      selectedKeys={active ? [active.key] : []}
      style={{ background: 'transparent', borderInlineEnd: 'none' }}
      items={ITEMS.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: <Link href={item.key}>{item.label}</Link>,
      }))}
    />
  )
}
