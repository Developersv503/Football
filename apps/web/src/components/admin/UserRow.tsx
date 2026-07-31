'use client'

import { useActionState, useState } from 'react'
import { adminAdjustPointsAction, adminUpdateUserAction, type ActionResult } from '@/lib/admin-actions'
import type { AdminUserRow } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

export function UserRow({ user }: { user: AdminUserRow }) {
  const [toggleState, toggleAction, togglePending] = useActionState(adminUpdateUserAction, initialState)
  const [roleState, roleAction, rolePending] = useActionState(adminUpdateUserAction, initialState)
  const [adjustState, adjustAction, adjustPending] = useActionState(adminAdjustPointsAction, initialState)
  const [showAdjust, setShowAdjust] = useState(false)

  return (
    <>
      <tr>
        <td className="wrap">{user.displayName}</td>
        <td className="wrap admin-mono">{user.email}</td>
        <td className="admin-mono">{user.profile?.pointsBalance ?? 0}</td>
        <td>
          <span className={`admin-pill ${user.role === 'ADMIN' ? 'warn' : 'muted'}`}>{user.role}</span>
        </td>
        <td>
          <span className={`admin-pill ${user.isActive ? 'ok' : 'danger'}`}>{user.isActive ? 'ACTIVA' : 'SUSPENDIDA'}</span>
        </td>
        <td>
          <div className="admin-btn-row">
            <form action={toggleAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="isActive" value={(!user.isActive).toString()} />
              <button type="submit" className="admin-btn" disabled={togglePending}>
                {user.isActive ? 'Suspender' : 'Reactivar'}
              </button>
            </form>
            <form action={roleAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="role" value={user.role === 'ADMIN' ? 'USER' : 'ADMIN'} />
              <button type="submit" className="admin-btn" disabled={rolePending}>
                {user.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin'}
              </button>
            </form>
            <button type="button" className="admin-btn" onClick={() => setShowAdjust((v) => !v)}>
              Ajustar puntos
            </button>
          </div>
          {toggleState.error ? <p className="admin-error">{toggleState.error}</p> : null}
          {roleState.error ? <p className="admin-error">{roleState.error}</p> : null}
          {showAdjust ? (
            <form action={adjustAction} className="admin-form-row" style={{ marginTop: 8 }}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="number" name="delta" placeholder="+/- pts" required style={{ width: 90 }} />
              <input type="text" name="note" placeholder="Motivo" style={{ flex: 1 }} />
              <button type="submit" className="admin-btn primary" disabled={adjustPending}>
                Guardar
              </button>
            </form>
          ) : null}
          {adjustState.error ? <p className="admin-error">{adjustState.error}</p> : null}
          {adjustState.ok ? <p className="admin-ok-msg">✓ Ajustado</p> : null}
        </td>
      </tr>
    </>
  )
}
