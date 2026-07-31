'use client'

import { useState, type ReactNode } from 'react'
import { LogoutOutlined, MenuOutlined, MoonFilled, SafetyCertificateFilled, SunFilled } from '@ant-design/icons'
import { Avatar, Button, Layout, Space, Tooltip, Typography } from 'antd'
import { adminLogoutAction } from '@/lib/admin-actions'
import { useAdminThemeMode } from '@/app/admin/AdminThemeProvider'
import { AdminNav } from './AdminNav'

const { Header, Sider, Content } = Layout

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { mode, toggle } = useAdminThemeMode()

  return (
    <Layout style={{ minHeight: '100dvh', background: 'var(--adm-bg)' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{ borderInlineEnd: '1px solid var(--adm-line)' }}
      >
        <div className="admin-sider-brand">
          <SafetyCertificateFilled style={{ fontSize: 18, color: 'var(--adm-accent-ink)' }} />
          {!collapsed && (
            <span>
              Panel <b>Pronóstico</b>
            </span>
          )}
        </div>
        <AdminNav />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed((v) => !v)}
            className="admin-collapse-btn"
          />
          <Space size={10} className="admin-header-end">
            <Tooltip title={mode === 'dark' ? 'Tema claro' : 'Tema oscuro'}>
              <Button
                type="text"
                shape="circle"
                icon={mode === 'dark' ? <SunFilled style={{ color: '#F5A623' }} /> : <MoonFilled style={{ color: '#0B84A5' }} />}
                onClick={toggle}
              />
            </Tooltip>
            <Space size={8} className="admin-user-chip">
              <Avatar size={26} style={{ background: 'var(--adm-accent)', color: 'var(--adm-accent-ink)', fontWeight: 700, fontSize: 12 }}>
                {email.charAt(0).toUpperCase()}
              </Avatar>
              <Typography.Text style={{ color: 'var(--adm-text-muted)', fontFamily: 'Plex Mono, monospace', fontSize: 11.5 }}>
                {email}
              </Typography.Text>
            </Space>
            <form action={adminLogoutAction}>
              <Button danger type="text" htmlType="submit" icon={<LogoutOutlined />}>
                Salir
              </Button>
            </form>
          </Space>
        </Header>
        <Content className="admin-main">{children}</Content>
      </Layout>
    </Layout>
  )
}
