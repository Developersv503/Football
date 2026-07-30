'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CompetitionOption } from '@/lib/api'

/**
 * Filtro de ligas. El estado vive en la URL (`?liga=`) y no en el
 * componente: así el filtro sobrevive a un refresh, se puede compartir por
 * link, y el listado se sigue renderizando en el servidor.
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return competitions
    return competitions.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.country ?? '').toLowerCase().includes(q),
    )
  }, [competitions, query])

  function pick(id: string | null) {
    router.push(id ? `/?liga=${encodeURIComponent(id)}` : '/')
  }

  const selectedName = competitions.find((c) => c.id === selected)?.name

  return (
    <div className="league-filter">
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
          <button type="button" className="league-clear" onClick={() => pick(null)}>
            Quitar filtro: {selectedName ?? 'liga'} ✕
          </button>
        ) : null}
      </div>

      <div className="league-chips">
        <button
          type="button"
          className={`league-chip${selected ? '' : ' active'}`}
          onClick={() => pick(null)}
        >
          Todas
        </button>
        {visible.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`league-chip${selected === c.id ? ' active' : ''}`}
            onClick={() => pick(c.id)}
          >
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
