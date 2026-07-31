'use client'

import { useActionState } from 'react'
import { adminLoginAction, type FormState } from '@/lib/admin-actions'

const initialState: FormState = { error: null }

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState)

  return (
    <form action={formAction} className="admin-form">
      <label>
        Email
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label>
        Contraseña
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      {state.error ? <p className="admin-error">{state.error}</p> : null}
      <button type="submit" className="admin-login-btn" disabled={pending}>
        {pending ? 'Ingresando…' : 'Ingresar al panel'}
      </button>
    </form>
  )
}
