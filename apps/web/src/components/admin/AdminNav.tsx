'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/concursos', label: 'Concursos' },
  { href: '/admin/canjes', label: 'Canjes' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/torneos', label: 'Torneos' },
  { href: '/admin/config', label: 'Config' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="admin-nav">
      {ITEMS.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} className={active ? 'active' : ''}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
