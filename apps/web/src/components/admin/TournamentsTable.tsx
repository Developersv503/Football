'use client'

import type { ColumnsType } from 'antd/es/table'
import { Table, Tag } from 'antd'
import type { TournamentCard } from '@/lib/api'
import { centsToMoney } from '@/lib/format'
import { TournamentStatusButton } from './TournamentAdminForms'

export function TournamentsTable({ tournaments }: { tournaments: TournamentCard[] }) {
  const columns: ColumnsType<TournamentCard> = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Tipo', dataIndex: 'type', key: 'type' },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: TournamentCard['status']) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: 'Pozo',
      dataIndex: 'prizePoolCents',
      key: 'prizePoolCents',
      render: (v: number) => <span style={{ fontFamily: 'Plex Mono, monospace' }}>{centsToMoney(v)}</span>,
    },
    { title: 'Acciones', key: 'actions', render: (_, t) => <TournamentStatusButton tournament={t} /> },
  ]

  return <Table rowKey="id" columns={columns} dataSource={tournaments} pagination={false} scroll={{ x: 600 }} size="middle" />
}
