'use client'

import { useActionState } from 'react'
import { adminCreateTournamentAction, adminUpdateTournamentStatusAction, type ActionResult } from '@/lib/admin-actions'
import type { TournamentCard } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

const NEXT_STATUS: Record<TournamentCard['status'], TournamentCard['status'] | null> = {
  UPCOMING: 'ACTIVE',
  ACTIVE: 'CLOSED',
  CLOSED: 'SETTLED',
  SETTLED: null,
}

export function CreateTournamentForm() {
  const [state, formAction, pending] = useActionState(adminCreateTournamentAction, initialState)

  return (
    <form action={formAction} className="admin-form wide">
      <div className="admin-form-row">
        <label>
          Nombre
          <input type="text" name="name" required maxLength={120} />
        </label>
        <label>
          Tipo
          <select name="type" defaultValue="DAILY">
            <option value="DAILY">Diario</option>
            <option value="MONTHLY">Mensual</option>
            <option value="CUSTOM">Personalizado</option>
          </select>
        </label>
      </div>
      <div className="admin-form-row">
        <label>
          Inicio
          <input type="datetime-local" name="startAt" required />
        </label>
        <label>
          Fin
          <input type="datetime-local" name="endAt" required />
        </label>
      </div>
      <div className="admin-form-row">
        <label>
          Entrada (centavos)
          <input type="number" name="entryFeeCents" min={0} defaultValue={0} />
        </label>
        <label>
          Pozo (centavos)
          <input type="number" name="prizePoolCents" min={0} defaultValue={0} />
        </label>
      </div>
      {state.error ? <p className="admin-error">{state.error}</p> : null}
      {state.ok ? <p className="admin-ok-msg">✓ Torneo creado</p> : null}
      <button type="submit" className="admin-btn primary" disabled={pending} style={{ alignSelf: 'flex-start' }}>
        {pending ? 'Creando…' : 'Crear torneo'}
      </button>
    </form>
  )
}

export function TournamentStatusButton({ tournament }: { tournament: TournamentCard }) {
  const [state, formAction, pending] = useActionState(adminUpdateTournamentStatusAction, initialState)
  const next = NEXT_STATUS[tournament.status]

  if (!next) return <span className="admin-pill muted">Cerrado</span>

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={tournament.id} />
      <input type="hidden" name="status" value={next} />
      <button type="submit" className="admin-btn" disabled={pending}>
        → {next}
      </button>
      {state.error ? <p className="admin-error">{state.error}</p> : null}
    </form>
  )
}
