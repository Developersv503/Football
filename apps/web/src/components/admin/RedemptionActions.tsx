'use client'

import { useActionState } from 'react'
import { CheckCircleOutlined, CloseCircleOutlined, PhoneOutlined } from '@ant-design/icons'
import { Alert, Button, Space, Tag } from 'antd'
import { adminResolveRedemptionAction, type ActionResult } from '@/lib/admin-actions'
import type { AdminRedemptionRow } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

export function RedemptionActions({ redemption }: { redemption: AdminRedemptionRow }) {
  const [state, formAction, pending] = useActionState(adminResolveRedemptionAction, initialState)
  const closed = redemption.status === 'PAID' || redemption.status === 'REJECTED'

  if (closed) return <Tag>Cerrado</Tag>

  return (
    <div>
      <Space size={6} wrap>
        <form action={formAction}>
          <input type="hidden" name="id" value={redemption.id} />
          <input type="hidden" name="status" value="CONTACTED" />
          <Button size="small" icon={<PhoneOutlined style={{ color: '#4CC9F0' }} />} htmlType="submit" loading={pending}>
            Contactado
          </Button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="id" value={redemption.id} />
          <input type="hidden" name="status" value="PAID" />
          <Button size="small" type="primary" icon={<CheckCircleOutlined />} htmlType="submit" loading={pending}>
            Pagado
          </Button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="id" value={redemption.id} />
          <input type="hidden" name="status" value="REJECTED" />
          <Button size="small" danger icon={<CloseCircleOutlined />} htmlType="submit" loading={pending}>
            Rechazar
          </Button>
        </form>
      </Space>
      {state.error ? <Alert type="error" message={state.error} showIcon banner style={{ marginTop: 6 }} /> : null}
    </div>
  )
}
