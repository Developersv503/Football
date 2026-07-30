'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { predictAction, type ActionResult } from '@/lib/actions'

const initialState: ActionResult = { ok: false, error: null }

export function PredictButtons({ eventId, isLoggedIn }: { eventId: string; isLoggedIn: boolean }) {
  const [state, formAction, pending] = useActionState(predictAction, initialState)

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="btn-predict">
        Pronosticar
      </Link>
    )
  }

  if (state.ok) {
    return <span className="pred-sent">✓ Pronóstico enviado</span>
  }

  return (
    <form action={formAction} className="predict-form">
      <input type="hidden" name="eventId" value={eventId} />
      <button name="outcome" value="HOME" disabled={pending} title="Gana local">
        1
      </button>
      <button name="outcome" value="DRAW" disabled={pending} title="Empate">
        X
      </button>
      <button name="outcome" value="AWAY" disabled={pending} title="Gana visitante">
        2
      </button>
      {state.error ? <span className="form-error-sm">{state.error}</span> : null}
    </form>
  )
}
