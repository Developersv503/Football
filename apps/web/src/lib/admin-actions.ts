'use server'

import { redirect } from 'next/navigation'
import {
  adminAdjustUserPoints,
  adminCreateTournament,
  adminEnsureMatchContest,
  adminResolveRedemption,
  adminSetRecommendedScore,
  adminSetRewardTiers,
  adminSetRoundConfig,
  adminSettleMatchContest,
  adminUpdateEvent,
  adminUpdateTournament,
  adminUpdateUser,
  loginUser,
  type PointsRedemptionStatus,
} from './api'
import { clearSessionCookie, getSession, getSessionToken, setSessionCookie } from './session'

export type FormState = { error: string | null }
export type ActionResult = { ok: boolean; error: string | null }

const okResult: ActionResult = { ok: true, error: null }

async function requireAdminToken(): Promise<string> {
  const token = await getSessionToken()
  if (!token) throw new Error('No autenticado')
  return token
}

export async function adminLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Completá email y contraseña.' }

  let accessToken: string
  try {
    ;({ accessToken } = await loginUser(email, password))
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'No se pudo iniciar sesión.' }
  }

  await setSessionCookie(accessToken)
  const session = await getSession()
  if (session?.user.role !== 'ADMIN') {
    await clearSessionCookie()
    return { error: 'Esta cuenta no tiene permisos de administrador.' }
  }
  redirect('/admin')
}

export async function adminLogoutAction(): Promise<void> {
  await clearSessionCookie()
  redirect('/admin/login')
}

export async function adminUpdateUserAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const userId = String(formData.get('userId') ?? '')
    const isActiveRaw = formData.get('isActive')
    const role = formData.get('role')
    await adminUpdateUser(token, userId, {
      ...(isActiveRaw !== null && { isActive: isActiveRaw === 'true' }),
      ...(role && { role: role as 'USER' | 'ADMIN' }),
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo actualizar el usuario.' }
  }
  return okResult
}

export async function adminAdjustPointsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const userId = String(formData.get('userId') ?? '')
    const delta = Number(formData.get('delta'))
    const note = String(formData.get('note') ?? '').trim()
    if (!userId || !Number.isInteger(delta) || delta === 0) return { ok: false, error: 'Datos inválidos.' }
    await adminAdjustUserPoints(token, userId, delta, note || undefined)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo ajustar el saldo.' }
  }
  return okResult
}

export async function adminResolveRedemptionAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? '') as PointsRedemptionStatus
    if (!['CONTACTED', 'PAID', 'REJECTED'].includes(status)) return { ok: false, error: 'Estado inválido.' }
    await adminResolveRedemption(token, id, status as 'CONTACTED' | 'PAID' | 'REJECTED')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo resolver el canje.' }
  }
  return okResult
}

export async function adminSetRoundConfigAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const roundLabel = String(formData.get('roundLabel') ?? '').trim()
    const targetPoints = Number(formData.get('targetPoints'))
    const currency = String(formData.get('currency') ?? '').trim()
    const pointsPerCurrencyUnit = Number(formData.get('pointsPerCurrencyUnit'))
    await adminSetRoundConfig(token, {
      ...(roundLabel && { roundLabel }),
      ...(Number.isInteger(targetPoints) && { targetPoints }),
      ...(currency && { currency }),
      ...(Number.isInteger(pointsPerCurrencyUnit) && pointsPerCurrencyUnit > 0 && { pointsPerCurrencyUnit }),
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo guardar la config.' }
  }
  return okResult
}

export async function adminEnsureContestAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const eventId = String(formData.get('eventId') ?? '')
    await adminEnsureMatchContest(token, eventId)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo activar el concurso.' }
  }
  return okResult
}

export async function adminSetRecommendedAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const eventId = String(formData.get('eventId') ?? '')
    const homeScore = Number(formData.get('homeScore'))
    const awayScore = Number(formData.get('awayScore'))
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) return { ok: false, error: 'Marcador inválido.' }
    await adminSetRecommendedScore(token, eventId, homeScore, awayScore)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo guardar el recomendado.' }
  }
  return okResult
}

export async function adminSetRewardTiersAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const eventId = String(formData.get('eventId') ?? '')
    const raw = String(formData.get('tiers') ?? '')
    // Formato simple: "1:1200,2:1000,3:500" — un puesto por línea o coma.
    const tiers = raw
      .split(/[,\n]/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [rank, points] = chunk.split(':').map((n) => Number(n.trim()))
        return { rank, points }
      })
    if (tiers.length === 0 || tiers.some((t) => !Number.isInteger(t.rank) || !Number.isInteger(t.points))) {
      return { ok: false, error: 'Formato inválido. Usá "1:1200, 2:1000, 3:500".' }
    }
    await adminSetRewardTiers(token, eventId, tiers)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudieron guardar los tramos.' }
  }
  return okResult
}

export async function adminSettleContestAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const eventId = String(formData.get('eventId') ?? '')
    await adminSettleMatchContest(token, eventId)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo liquidar.' }
  }
  return okResult
}

export async function adminCreateTournamentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const name = String(formData.get('name') ?? '').trim()
    const type = String(formData.get('type') ?? '') as 'DAILY' | 'MONTHLY' | 'CUSTOM'
    const startAt = String(formData.get('startAt') ?? '')
    const endAt = String(formData.get('endAt') ?? '')
    const entryFeeCents = Number(formData.get('entryFeeCents') ?? 0)
    const prizePoolCents = Number(formData.get('prizePoolCents') ?? 0)
    if (!name || !startAt || !endAt) return { ok: false, error: 'Completá nombre y fechas.' }
    await adminCreateTournament(token, {
      name,
      type,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      entryFeeCents,
      prizePoolCents,
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo crear el torneo.' }
  }
  return okResult
}

export async function adminUpdateTournamentStatusAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? '') as 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'SETTLED'
    await adminUpdateTournament(token, id, { status })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo actualizar el torneo.' }
  }
  return okResult
}

export async function adminUpdateEventAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const token = await requireAdminToken()
    const id = String(formData.get('id') ?? '')
    const status = formData.get('status')
    const homeScoreRaw = formData.get('homeScore')
    const awayScoreRaw = formData.get('awayScore')
    await adminUpdateEvent(token, id, {
      ...(status && { status: status as 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' }),
      ...(homeScoreRaw !== null && homeScoreRaw !== '' && { homeScore: Number(homeScoreRaw) }),
      ...(awayScoreRaw !== null && awayScoreRaw !== '' && { awayScore: Number(awayScoreRaw) }),
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo corregir el evento.' }
  }
  return okResult
}
