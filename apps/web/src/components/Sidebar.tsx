'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import { logoutAction } from '@/lib/actions'
import { initials } from '@/lib/format'
import { ThemeToggle } from './ThemeToggle'

export type NavKey =
  | 'matches'
  | 'torneos'
  | 'pronosticos'
  | 'puntos'
  | 'bonificaciones'
  | 'pronosticadores'
  | 'casas'
  | 'articulos'

const NAV_ITEMS: { key: NavKey; label: string; href: string; rect?: boolean; icon: ReactNode }[] = [
  { key: 'matches', label: 'Matches', href: '/', rect: true, icon: <path d="M3 9h18M8 4v3M16 4v3" /> },
  {
    key: 'torneos',
    label: 'Torneos de pronósticos',
    href: '/torneos',
    icon: <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM4 6h3M17 6h3" />,
  },
  {
    key: 'pronosticos',
    label: 'Pronósticos',
    href: '/pronosticos',
    icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />,
  },
  {
    key: 'puntos',
    label: 'Mis puntos',
    href: '/puntos',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
  },
  {
    key: 'bonificaciones',
    label: 'Bonificaciones',
    href: '/bonificaciones',
    icon: <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M2 7h20v5H2zM12 22V7M12 7a2.5 2.5 0 010-5C14 2 12 7 12 7zM12 7a2.5 2.5 0 000-5C10 2 12 7 12 7z" />,
  },
  {
    key: 'pronosticadores',
    label: 'Pronosticadores',
    href: '/pronosticadores',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0112 0v1M17 11l1.5 1.5L21 10" />
      </>
    ),
  },
  {
    key: 'casas',
    label: 'Casas de apuestas',
    href: '/casas-de-apuestas',
    icon: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M6 14h4" />
      </>
    ),
  },
  {
    key: 'articulos',
    label: 'Artículos',
    href: '/articulos',
    icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" />,
  },
]

export function Sidebar({
  eventsToday,
  user,
  active,
}: {
  eventsToday: number
  user: { displayName: string; email: string } | null
  active: NavKey
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="brand">
          <div className="brand-mark">P</div>
          <div className="brand-text">Pronóstico</div>
        </div>
      </div>

      {open ? (
        <div className="sidebar-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      ) : null}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">P</div>
          <div className="brand-text">
            Pronóstico
            <span>Competí. Acertá. Ganá.</span>
          </div>
        </div>

        <nav className="primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              className={`nav-item${item.key === active ? ' active' : ''}`}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {item.rect ? <rect x="3" y="4" width="18" height="16" rx="2" /> : null}
                {item.icon}
              </svg>
              {item.label}
              {item.key === 'matches' ? <span className="nav-count tnum">{eventsToday}</span> : null}
            </Link>
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
              <Link href="/login" className="btn-auth-sm" onClick={() => setOpen(false)}>
                Ingresar
              </Link>
              <Link href="/register" className="btn-auth-sm ghost" onClick={() => setOpen(false)}>
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
