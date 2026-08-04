/**
 * Goalserve serializa XML a JSON sin normalizar: un nodo con un solo hijo
 * llega como objeto, con varios llega como array. Sin este helper el parser
 * rompe apenas una liga tiene un único partido en el día (caso real, visto
 * en pruebas contra el feed).
 */
export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}
