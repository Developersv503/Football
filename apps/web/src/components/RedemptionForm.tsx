'use client'

import { useActionState } from 'react'
import { requestRedemptionAction, type ActionResult } from '@/lib/actions'

const initialState: ActionResult = { ok: false, error: null }

export function RedemptionForm({ pointsBalance }: { pointsBalance: number }) {
  const [state, formAction, pending] = useActionState(requestRedemptionAction, initialState)

  if (state.ok) {
    return (
      <p className="join-ok">
        ✓ Solicitud enviada. Te vamos a contactar para coordinar la transferencia.
      </p>
    )
  }

  if (pointsBalance <= 0) {
    return <p className="detail-empty">Todavía no tenés puntos para canjear.</p>
  }

  return (
    <form action={formAction} className="auth-form redemption-form">
      <label>
        Puntos a canjear (tenés {pointsBalance})
        <input type="number" name="pointsAmount" min={1} max={pointsBalance} required inputMode="numeric" />
      </label>
      <label>
        Teléfono de contacto
        <input type="tel" name="contactPhone" required placeholder="+502 5555 5555" />
      </label>
      <label>
        Nota (opcional)
        <input type="text" name="contactNote" maxLength={280} placeholder="Mejor horario para contactarte, etc." />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-auth" disabled={pending}>
        {pending ? 'Enviando…' : 'Solicitar canje'}
      </button>
    </form>
  )
}
