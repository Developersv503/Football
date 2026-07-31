'use client'

import { useActionState } from 'react'
import { adminSetRoundConfigAction, type ActionResult } from '@/lib/admin-actions'
import type { RoundConfig } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

export function RoundConfigForm({ config }: { config: RoundConfig }) {
  const [state, formAction, pending] = useActionState(adminSetRoundConfigAction, initialState)

  return (
    <form action={formAction} className="admin-form wide">
      <label>
        Etiqueta de la jornada
        <input type="text" name="roundLabel" defaultValue={config.roundLabel} maxLength={80} />
      </label>
      <div className="admin-form-row">
        <label>
          Meta de puntos de la jornada
          <input type="number" name="targetPoints" min={0} defaultValue={config.targetPoints} />
        </label>
        <label>
          Moneda
          <input type="text" name="currency" defaultValue={config.currency} maxLength={10} />
        </label>
        <label>
          Puntos por unidad de moneda
          <input type="number" name="pointsPerCurrencyUnit" min={1} defaultValue={config.pointsPerCurrencyUnit} />
        </label>
      </div>
      {state.error ? <p className="admin-error">{state.error}</p> : null}
      {state.ok ? <p className="admin-ok-msg">✓ Guardado</p> : null}
      <button type="submit" className="admin-btn primary" disabled={pending} style={{ alignSelf: 'flex-start' }}>
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  )
}
