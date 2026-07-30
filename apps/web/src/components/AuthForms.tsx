'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { loginAction, registerAction, type FormState } from '@/lib/actions'

const initialState: FormState = { error: null }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="auth-form">
      <label>
        Email
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label>
        Contraseña
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-auth" disabled={pending}>
        {pending ? 'Ingresando…' : 'Ingresar'}
      </button>
      <p className="auth-alt">
        ¿No tenés cuenta? <Link href="/register">Registrate</Link>
      </p>
    </form>
  )
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState)

  return (
    <form action={formAction} className="auth-form">
      <label>
        Nombre para mostrar
        <input type="text" name="displayName" required minLength={2} maxLength={40} autoComplete="nickname" />
      </label>
      <label>
        Email
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label>
        Contraseña
        <input type="password" name="password" required minLength={8} maxLength={72} autoComplete="new-password" />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-auth" disabled={pending}>
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
      <p className="auth-alt">
        ¿Ya tenés cuenta? <Link href="/login">Ingresá</Link>
      </p>
    </form>
  )
}
