import { toArray } from './array.util'
import { fetchJsonWithRetry } from './http-retry.util'

const GOALSERVE_BASE = 'https://www.goalserve.com/getfeed'
// Fijo por el paquete contratado (Soccer Pregame Odds, subscription id 6062)
// — así lo entrega el dashboard de Goalserve, no es un filtro nuestro.
const ODDS_CATEGORY = 'soccer_10'
const MATCH_WINNER_MARKET = 'Match Winner'

export interface BookmakerOdds {
  bookmaker: string
  home: string | null
  draw: string | null
  away: string | null
}

export interface GoalserveOddsMatch {
  goalserveId: string
  homeTeamRaw: string
  awayTeamRaw: string
  dateKey: string // formatted_date tal cual llega, "DD.MM.YYYY" — misma clave para matchear
  bookmakers: BookmakerOdds[]
}

/**
 * Sin date_start/date_end el feed de odds trae TODO lo pendiente sin
 * filtrar — confirmado en pruebas: 110MB por request. Nunca llamar esta
 * función sin filtro de fecha.
 */
export async function fetchGoalserveOddsForDate(
  apiKey: string,
  dateDDMMYYYY: string,
): Promise<GoalserveOddsMatch[]> {
  const url =
    `${GOALSERVE_BASE}/${apiKey}/getodds/soccer?cat=${ODDS_CATEGORY}&json=1` +
    `&date_start=${dateDDMMYYYY}&date_end=${dateDDMMYYYY}`

  const data = await fetchJsonWithRetry(url)
  const categories = toArray(data?.scores?.categories)

  const result: GoalserveOddsMatch[] = []

  for (const category of categories) {
    for (const match of toArray(category.matches)) {
      const markets = toArray(match.odds)
      const matchWinner = markets.find((m: any) => m.value === MATCH_WINNER_MARKET)
      if (!matchWinner) continue

      const bookmakers: BookmakerOdds[] = toArray(matchWinner.bookmakers).map((bm: any) => {
        const odds = toArray(bm.odds)
        const find = (name: string) => odds.find((o: any) => o.name === name)?.value ?? null
        return {
          bookmaker: bm.name,
          home: find('Home'),
          draw: find('Draw'),
          away: find('Away'),
        }
      })

      if (bookmakers.length === 0) continue

      result.push({
        goalserveId: match.fix_id ?? match.id,
        homeTeamRaw: match.localteam?.name ?? '',
        awayTeamRaw: match.visitorteam?.name ?? '',
        dateKey: match.formatted_date,
        bookmakers,
      })
    }
  }

  return result
}

/** "DD.MM.YYYY", formato que exige Goalserve — Date.toISOString() no sirve acá. */
export function toGoalserveDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${date.getFullYear()}`
}

/** lowercase, sin acentos ni puntuación — para matchear nombres de equipo entre proveedores. */
export function normalizeTeamName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}
