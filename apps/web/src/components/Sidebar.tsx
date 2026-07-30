import type { ReactNode } from 'react'
import Link from 'next/link'
import { logoutAction } from '@/lib/actions'
import { initials } from '@/lib/format'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS: { label: string; active?: boolean; rect?: boolean; icon: ReactNode }[] = [
  { label: 'Matches', active: true, rect: true, icon: <path d="M3 9h18M8 4v3M16 4v3" /> },
  { label: 'Torneos de pronósticos', icon: <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM4 6h3M17 6h3" /> },
  { label: 'Pronósticos', icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
  {
    label: 'Bonificaciones',
    icon: <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M2 7h20v5H2zM12 22V7M12 7a2.5 2.5 0 010-5C14 2 12 7 12 7zM12 7a2.5 2.5 0 000-5C10 2 12 7 12 7z" />,
  },
  {
    label: 'Pronosticadores',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0112 0v1M17 11l1.5 1.5L21 10" />
      </>
    ),
  },
  {
    label: 'Casas de apuestas',
    icon: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M6 14h4" />
      </>
    ),
  },
  { label: 'Artículos', icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" /> },
]

export function Sidebar({
  eventsToday,
  user,
}: {
  eventsToday: number
  user: { displayName: string; email: string } | null
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div className="brand-text">
          Pronóstico
          <span>Competí. Acertá. Ganá.</span>
        </div>
      </div>

      <nav className="primary">
        {NAV_ITEMS.map((item) => (
          <a key={item.label} className={`nav-item${item.active ? ' active' : ''}`} href="#">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {item.rect ? <rect x="3" y="4" width="18" height="16" rx="2" /> : null}
              {item.icon}
            </svg>
            {item.label}
            {item.active ? <span className="nav-count tnum">{eventsToday}</span> : null}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle />
        {user ? (
          <div className="user-chip">
            <div className="user-avatar">{initials(user.displayName)}</div>
            <div className="user-meta">
              <div className="user-name">{user.displayName}</div>
              <div className="user-rank">{user.email}</div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="logout-btn" title="Cerrar sesión" aria-label="Cerrar sesión">
                ⏻
              </button>
            </form>
          </div>
        ) : (
          <div className="auth-links">
            <Link href="/login" className="btn-auth-sm">
              Ingresar
            </Link>
            <Link href="/register" className="btn-auth-sm ghost">
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
