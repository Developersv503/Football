/**
 * Paginación keyset (cursor por `id`), NUNCA offset/limit. Con offset, la
 * página 500 de una tabla de eventos obliga a Postgres a escanear y
 * descartar las primeras 500*take filas — se degrada con el tamaño de la
 * tabla. Con cursor, el WHERE usa el índice directo sin importar cuán
 * adentro de la lista estés.
 *
 * Uso en el service: pedir `take + 1` filas or der por columna indexada
 * (+ id como desempate), pasar el resultado a `buildCursorPage`.
 */
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 50

export function clampPageSize(requested?: number): number {
  if (!requested || requested <= 0) return DEFAULT_PAGE_SIZE
  return Math.min(requested, MAX_PAGE_SIZE)
}

export function buildCursorPage<T extends { id: string }>(
  rows: T[],
  take: number,
): CursorPage<T> {
  const hasMore = rows.length > take
  const items = hasMore ? rows.slice(0, take) : rows
  const nextCursor = hasMore ? items[items.length - 1]!.id : null
  return { items, nextCursor }
}
