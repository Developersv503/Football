'use server'

import { redirect } from 'next/navigation'
import { createPrediction, joinTournament, loginUser, registerUser, type PredictionOutcome } from './api'
import { clearSessionCookie, getSessionToken, setSessionCookie } from './session'

export type FormState = { error: string | null }

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const displayName = String(formData.get('displayName') ?? '').trim()
  if (!email || !password || !displayName) return { error: 'Completá todos los campos.' }

  let accessToken: string
  try {
    ;({ accessToken } = await registerUser(email, password, displayName))
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'No se pudo registrar.' }
  }
  await setSessionCookie(accessToken)
  redirect('/')
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
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
  redirect('/')
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie()
  redirect('/')
}

export type ActionResult = { ok: boolean; error: string | null }

export async function predictAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getSessionToken()
  if (!token) return { ok: false, error: 'Iniciá sesión para pronosticar.' }

  const eventId = String(formData.get('eventId') ?? '')
  const outcome = String(formData.get('outcome') ?? '')
  if (!eventId || !['HOME', 'DRAW', 'AWAY'].includes(outcome)) return { ok: false, error: 'Datos inválidos.' }

  try {
    await createPrediction(token, eventId, outcome as PredictionOutcome)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo enviar el pronóstico.' }
  }
  return { ok: true, error: null }
}

export async function joinTournamentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = await getSessionToken()
  if (!token) return { ok: false, error: 'Iniciá sesión para unirte al torneo.' }

  const tournamentId = String(formData.get('tournamentId') ?? '')
  if (!tournamentId) return { ok: false, error: 'Torneo inválido.' }

  try {
    await joinTournament(token, tournamentId)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo unir al torneo.' }
  }
  return { ok: true, error: null }
}
