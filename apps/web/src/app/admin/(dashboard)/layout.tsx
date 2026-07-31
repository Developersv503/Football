import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function AdminGuardedLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login')

  return <AdminShell email={session.user.email}>{children}</AdminShell>
}
