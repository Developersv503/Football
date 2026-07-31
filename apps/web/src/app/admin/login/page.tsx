import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import '../admin.css'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-mark">P</div>
        <h1>Panel administrativo</h1>
        <p className="admin-login-sub">Acceso exclusivo del dueño — cuentas de usuario normales no entran acá.</p>
        <AdminLoginForm />
      </div>
    </div>
  )
}
