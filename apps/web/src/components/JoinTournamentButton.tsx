'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { joinTournamentAction, type ActionResult } from '@/lib/actions'

const initialState: ActionResult = { ok: false, error: null }

export function JoinTournamentButton({ tournamentId, isLoggedIn }: { tournamentId: string; isLoggedIn: boolean }) {
  const [state, formAction, pending] = useActionState(joinTournamentAction, initialState)

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="btn-join">
        Unirme al torneo
      </Link>
    )
  }

  if (state.ok) {
    return <div className="join-ok">✓ Ya estás inscripto</div>
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <button type="submit" className="btn-join" disabled={pending}>
        {pending ? 'Uniendo…' : 'Unirme al torneo'}
      </button>
      {state.error ? <p className="form-error-sm">{state.error}</p> : null}
    </form>
  )
}
