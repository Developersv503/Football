'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CompetitionOption } from '@/lib/api'

/**
 * Filtro de ligas. El estado vive en la URL (`?liga=`) y no en el
 * componente: así el filtro sobrevive a un refresh, se puede compartir por
 * link, y el listado se sigue renderizando en el servidor.
 *
 * El re-render del servidor puede tardar varios segundos (la API en Hobby
 * se enfría entre requests) — sin `isPending` el click no muestra nada
 * hasta que termina y se siente roto. `useTransition` da el feedback
 * inmediato aunque la navegación en sí siga tardando lo mismo.
 */
export function LeagueFilter({
  competitions,
  selected,
}: {
  competitions: CompetitionOption[]
  selected: string | null
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return competitions
    return competitions.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.country ?? '').toLowerCase().includes(q),
    )
  }, [competitions, query])

  function pick(id: string | null) {
    setPendingId(id)
    startTransition(() => {
      router.push(id ? `/?liga=${encodeURIComponent(id)}` : '/')
    })
  }

  const selectedName = competitions.find((c) => c.id === selected)?.name

  return (
    <div className={`league-filter${isPending ? ' is-pending' : ''}`}>
      <div className="league-filter-head">
        <input
          className="league-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar liga o país — España, Italia, Champions…"
          aria-label="Buscar liga o país"
        />
        {selected ? (
          <button type="button" className="league-clear" disabled={isPending} onClick={() => pick(null)}>
            Quitar filtro: {selectedName ?? 'liga'} ✕
          </button>
        ) : null}
      </div>

      <div className="league-chips">
        <button
          type="button"
          disabled={isPending}
          className={`league-chip${selected ? '' : ' active'}${isPending && pendingId === null ? ' loading' : ''}`}
          onClick={() => pick(null)}
        >
          {isPending && pendingId === null ? <span className="league-chip-spinner" /> : null}
          Todas
        </button>
        {visible.map((c) => (
          <button
            type="button"
            key={c.id}
            disabled={isPending}
            className={`league-chip${selected === c.id ? ' active' : ''}${isPending && pendingId === c.id ? ' loading' : ''}`}
            onClick={() => pick(c.id)}
          >
            {isPending && pendingId === c.id ? <span className="league-chip-spinner" /> : null}
            {c.country ? <span className="league-chip-country">{c.country}</span> : null}
            {c.name}
            <span className="league-chip-count tnum">{c.eventCount}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="league-no-match">
          Ninguna liga sincronizada coincide con “{query}”. Solo se listan competiciones que ya
          tienen partidos en la base.
        </div>
      ) : null}
    </div>
  )
}
