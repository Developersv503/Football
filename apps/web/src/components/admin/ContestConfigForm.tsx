'use client'

import { useActionState, useState } from 'react'
import {
  adminEnsureContestAction,
  adminSetRecommendedAction,
  adminSetRewardTiersAction,
  adminSettleContestAction,
  type ActionResult,
} from '@/lib/admin-actions'
import type { EventCard, MatchContest } from '@/lib/api'

const initialState: ActionResult = { ok: false, error: null }

function tiersToText(tiers: { rank: number; points: number }[]): string {
  return tiers.map((t) => `${t.rank}:${t.points}`).join(', ')
}

export function ContestConfigForm({ event, contest }: { event: EventCard; contest: MatchContest | null }) {
  const [ensureState, ensureAction, ensurePending] = useActionState(adminEnsureContestAction, initialState)
  const [recState, recAction, recPending] = useActionState(adminSetRecommendedAction, initialState)
  const [tiersState, tiersAction, tiersPending] = useActionState(adminSetRewardTiersAction, initialState)
  const [settleState, settleAction, settlePending] = useActionState(adminSettleContestAction, initialState)
  const [open, setOpen] = useState(false)

  if (!contest && !open) {
    return (
      <form action={ensureAction}>
        <input type="hidden" name="eventId" value={event.id} />
        <button type="submit" className="admin-btn primary" disabled={ensurePending} onClick={() => setOpen(true)}>
          Activar concurso
        </button>
        {ensureState.error ? <p className="admin-error">{ensureState.error}</p> : null}
      </form>
    )
  }

  return (
    <div className="admin-form-row" style={{ flexWrap: 'wrap', gap: 16 }}>
      <form action={recAction} className="admin-form" style={{ maxWidth: 220 }}>
        <input type="hidden" name="eventId" value={event.id} />
        <label>
          Recomendado (local-visita)
          <div className="admin-form-row">
            <input type="number" name="homeScore" min={0} defaultValue={contest?.recommendedHomeScore ?? 0} />
            <input type="number" name="awayScore" min={0} defaultValue={contest?.recommendedAwayScore ?? 0} />
          </div>
        </label>
        <button type="submit" className="admin-btn" disabled={recPending}>
          Guardar recomendado
        </button>
        {recState.error ? <p className="admin-error">{recState.error}</p> : null}
      </form>

      <form action={tiersAction} className="admin-form" style={{ maxWidth: 280 }}>
        <input type="hidden" name="eventId" value={event.id} />
        <label>
          Tramos de puntos (rank:puntos)
          <input type="text" name="tiers" placeholder="1:1200, 2:1000, 3:500" defaultValue={contest ? tiersToText(contest.rewardTiers) : ''} />
        </label>
        <button type="submit" className="admin-btn" disabled={tiersPending}>
          Guardar tramos
        </button>
        {tiersState.error ? <p className="admin-error">{tiersState.error}</p> : null}
      </form>

      <div className="admin-form" style={{ maxWidth: 160, justifyContent: 'flex-end' }}>
        <span className={`admin-pill ${contest?.status === 'SETTLED' ? 'muted' : 'ok'}`}>{contest?.status ?? 'OPEN'}</span>
        {event.status === 'FINISHED' && contest?.status !== 'SETTLED' ? (
          <form action={settleAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <button type="submit" className="admin-btn primary" disabled={settlePending}>
              Liquidar ahora
            </button>
          </form>
        ) : null}
        {settleState.ok ? <p className="admin-ok-msg">✓ Liquidado</p> : null}
        {settleState.error ? <p className="admin-error">{settleState.error}</p> : null}
      </div>
    </div>
  )
}
