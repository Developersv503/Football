import { RegisterForm } from '@/components/AuthForms'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand-mark">P</div>
        <h1>Creá tu cuenta</h1>
        <p className="auth-sub">Primer pronóstico gratis — sin costo de entrada al torneo diario.</p>
        <RegisterForm />
      </div>
    </div>
  )
}
