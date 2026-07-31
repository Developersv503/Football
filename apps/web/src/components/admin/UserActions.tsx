'use client'

import { useActionState, useState } from 'react'
import { CrownOutlined, StopOutlined, UndoOutlined, WalletOutlined } from '@ant-design/icons'
import { Alert, Button, Input, Space } from 'antd'
import { adminAdjustPointsAction, adminUpdateUserAction, type ActionResult } from '@/lib/admin-actions'
import type { AdminUserRow } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

export function UserActions({ user }: { user: AdminUserRow }) {
  const [toggleState, toggleAction, togglePending] = useActionState(adminUpdateUserAction, initialState)
  const [roleState, roleAction, rolePending] = useActionState(adminUpdateUserAction, initialState)
  const [adjustState, adjustAction, adjustPending] = useActionState(adminAdjustPointsAction, initialState)
  const [showAdjust, setShowAdjust] = useState(false)

  return (
    <div>
      <Space size={6} wrap>
        <form action={toggleAction}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="isActive" value={(!user.isActive).toString()} />
          <Button
            size="small"
            danger={user.isActive}
            icon={user.isActive ? <StopOutlined /> : <UndoOutlined />}
            htmlType="submit"
            loading={togglePending}
          >
            {user.isActive ? 'Suspender' : 'Reactivar'}
          </Button>
        </form>
        <form action={roleAction}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="role" value={user.role === 'ADMIN' ? 'USER' : 'ADMIN'} />
          <Button size="small" icon={<CrownOutlined style={{ color: '#F5A623' }} />} htmlType="submit" loading={rolePending}>
            {user.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin'}
          </Button>
        </form>
        <Button size="small" icon={<WalletOutlined style={{ color: '#4CC9F0' }} />} onClick={() => setShowAdjust((v) => !v)}>
          Ajustar puntos
        </Button>
      </Space>

      {toggleState.error ? <Alert type="error" message={toggleState.error} showIcon banner style={{ marginTop: 6 }} /> : null}
      {roleState.error ? <Alert type="error" message={roleState.error} showIcon banner style={{ marginTop: 6 }} /> : null}

      {showAdjust ? (
        <form action={adjustAction}>
          <input type="hidden" name="userId" value={user.id} />
          <Space size={6} style={{ marginTop: 8 }}>
            <Input name="delta" type="number" placeholder="+/- pts" required style={{ width: 90 }} size="small" />
            <Input name="note" type="text" placeholder="Motivo" style={{ width: 140 }} size="small" />
            <Button type="primary" size="small" htmlType="submit" loading={adjustPending}>
              Guardar
            </Button>
          </Space>
        </form>
      ) : null}
      {adjustState.error ? <Alert type="error" message={adjustState.error} showIcon banner style={{ marginTop: 6 }} /> : null}
      {adjustState.ok ? <Alert type="success" message="Ajustado" showIcon banner style={{ marginTop: 6 }} /> : null}
    </div>
  )
}
