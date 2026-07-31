import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <AdminLoginForm />
      </div>
    </div>
  )
}
