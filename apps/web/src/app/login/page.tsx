import { LoginForm } from '@/components/AuthForms'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand-mark">P</div>
        <h1>Ingresá a tu cuenta</h1>
        <p className="auth-sub">Competí en torneos de pronósticos deportivos con premios reales.</p>
        <LoginForm />
      </div>
    </div>
  )
}
