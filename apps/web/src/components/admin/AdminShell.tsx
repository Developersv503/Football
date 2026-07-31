import type { ReactNode } from 'react'
import { adminLogoutAction } from '@/lib/admin-actions'
import { AdminNav } from './AdminNav'

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          Panel <span>Pronóstico</span>
        </div>
        <span className="admin-user">{email}</span>
        <form action={adminLogoutAction}>
          <button type="submit" className="admin-logout">
            Salir
          </button>
        </form>
      </header>
      <AdminNav />
      <main className="admin-main">{children}</main>
    </div>
  )
}
