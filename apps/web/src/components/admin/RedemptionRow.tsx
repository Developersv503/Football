'use client'

import { useActionState } from 'react'
import { adminResolveRedemptionAction, type ActionResult } from '@/lib/admin-actions'
import type { AdminRedemptionRow } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

const STATUS_PILL: Record<string, string> = { REQUESTED: 'warn', CONTACTED: 'accent', PAID: 'ok', REJECTED: 'danger' }

export function RedemptionRow({ redemption }: { redemption: AdminRedemptionRow }) {
  const [state, formAction, pending] = useActionState(adminResolveRedemptionAction, initialState)
  const closed = redemption.status === 'PAID' || redemption.status === 'REJECTED'

  return (
    <tr>
      <td className="wrap">{redemption.user.displayName}</td>
      <td className="admin-mono">{redemption.pointsAmount}</td>
      <td className="wrap">{redemption.contactPhone ?? '—'}</td>
      <td className="wrap">{redemption.contactNote ?? '—'}</td>
      <td>
        <span className={`admin-pill ${STATUS_PILL[redemption.status] ?? 'muted'}`}>{redemption.status}</span>
      </td>
      <td>
        {closed ? (
          <span className="admin-pill muted">Cerrado</span>
        ) : (
          <div className="admin-btn-row">
            <form action={formAction}>
              <input type="hidden" name="id" value={redemption.id} />
              <input type="hidden" name="status" value="CONTACTED" />
              <button type="submit" className="admin-btn" disabled={pending}>
                Contactado
              </button>
            </form>
            <form action={formAction}>
              <input type="hidden" name="id" value={redemption.id} />
              <input type="hidden" name="status" value="PAID" />
              <button type="submit" className="admin-btn primary" disabled={pending}>
                Pagado
              </button>
            </form>
            <form action={formAction}>
              <input type="hidden" name="id" value={redemption.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <button type="submit" className="admin-btn danger" disabled={pending}>
                Rechazar
              </button>
            </form>
          </div>
        )}
        {state.error ? <p className="admin-error">{state.error}</p> : null}
      </td>
    </tr>
  )
}
