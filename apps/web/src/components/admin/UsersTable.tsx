'use client'

import type { ColumnsType } from 'antd/es/table'
import { Table, Tag, Typography } from 'antd'
import type { AdminUserRow } from '@/lib/api'
import { UserActions } from './UserActions'

export function UsersTable({ users }: { users: AdminUserRow[] }) {
  const columns: ColumnsType<AdminUserRow> = [
    { title: 'Nombre', dataIndex: 'displayName', key: 'displayName' },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <Typography.Text style={{ fontFamily: 'Plex Mono, monospace', fontSize: 12 }}>{email}</Typography.Text>,
    },
    {
      title: 'Puntos',
      dataIndex: ['profile', 'pointsBalance'],
      key: 'points',
      render: (_, r) => <span style={{ fontFamily: 'Plex Mono, monospace' }}>{r.profile?.pointsBalance ?? 0}</span>,
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: AdminUserRow['role']) => <Tag color={role === 'ADMIN' ? 'gold' : 'default'}>{role}</Tag>,
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ACTIVA' : 'SUSPENDIDA'}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, user) => <UserActions user={user} />,
    },
  ]

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={users}
      pagination={false}
      scroll={{ x: 760 }}
      size="middle"
    />
  )
}
