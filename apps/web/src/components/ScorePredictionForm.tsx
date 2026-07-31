'use client'

import { useActionState } from 'react'
import { submitScoreAction, type ActionResult } from '@/lib/actions'

const initialState: ActionResult = { ok: false, error: null }

export function ScorePredictionForm({
  eventId,
  homeTeam,
  awayTeam,
}: {
  eventId: string
  homeTeam: string
  awayTeam: string
}) {
  const [state, formAction, pending] = useActionState(submitScoreAction, initialState)

  if (state.ok) {
    return <span className="pred-sent">✓ Pronóstico de marcador enviado</span>
  }

  return (
    <form action={formAction} className="score-predict-form">
      <input type="hidden" name="eventId" value={eventId} />
      <label className="score-input-group">
        <span>{homeTeam}</span>
        <input type="number" name="homeScore" min={0} max={50} required inputMode="numeric" defaultValue={0} />
      </label>
      <span className="score-vs">–</span>
      <label className="score-input-group">
        <span>{awayTeam}</span>
        <input type="number" name="awayScore" min={0} max={50} required inputMode="numeric" defaultValue={0} />
      </label>
      <button type="submit" className="btn-predict" disabled={pending}>
        {pending ? 'Enviando…' : 'Pronosticar marcador'}
      </button>
      {state.error ? <span className="form-error-sm">{state.error}</span> : null}
    </form>
  )
}
