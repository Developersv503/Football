'use client'

import type { ColumnsType } from 'antd/es/table'
import { Table, Tag } from 'antd'
import type { AdminRedemptionRow } from '@/lib/api'
import { RedemptionActions } from './RedemptionActions'

const STATUS_COLOR: Record<string, string> = { REQUESTED: 'gold', CONTACTED: 'blue', PAID: 'green', REJECTED: 'red' }

export function RedemptionsTable({ redemptions }: { redemptions: AdminRedemptionRow[] }) {
  const columns: ColumnsType<AdminRedemptionRow> = [
    { title: 'Usuario', dataIndex: ['user', 'displayName'], key: 'user' },
    {
      title: 'Puntos',
      dataIndex: 'pointsAmount',
      key: 'pointsAmount',
      render: (v: number) => <span style={{ fontFamily: 'Plex Mono, monospace' }}>{v}</span>,
    },
    { title: 'Teléfono', dataIndex: 'contactPhone', key: 'contactPhone', render: (v: string | null) => v ?? '—' },
    { title: 'Nota', dataIndex: 'contactNote', key: 'contactNote', render: (v: string | null) => v ?? '—' },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={STATUS_COLOR[status] ?? 'default'}>{status}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, redemption) => <RedemptionActions redemption={redemption} />,
    },
  ]

  return <Table rowKey="id" columns={columns} dataSource={redemptions} pagination={false} scroll={{ x: 760 }} size="middle" />
}
