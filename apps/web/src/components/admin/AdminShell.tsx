'use client'

import { useState, type ReactNode } from 'react'
import { LogoutOutlined, MenuOutlined, SafetyCertificateFilled } from '@ant-design/icons'
import { Avatar, Button, Layout, Space, Typography } from 'antd'
import { adminLogoutAction } from '@/lib/admin-actions'
import { AdminNav } from './AdminNav'

const { Header, Sider, Content } = Layout

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

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
          <SafetyCertificateFilled style={{ fontSize: 18, color: '#04222C' }} />
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
          <div style={{ flex: 1 }} />
          <Space size={14}>
            <Space size={8} className="admin-user-chip">
              <Avatar size={26} style={{ background: 'var(--adm-accent)', color: '#04222C', fontWeight: 700, fontSize: 12 }}>
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
