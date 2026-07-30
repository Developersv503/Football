import type { MatchDetail, TeamLineup } from '@/lib/api'

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: 'Arquero',
  defender: 'Defensor',
  midfielder: 'Mediocampista',
  forward: 'Delantero',
  right_back: 'Lateral der.',
  left_back: 'Lateral izq.',
  central_defender: 'Central',
  defensive_midfielder: 'Volante def.',
  central_midfielder: 'Volante central',
  attacking_midfielder: 'Enganche',
  right_midfielder: 'Volante der.',
  left_midfielder: 'Volante izq.',
  right_winger: 'Extremo der.',
  left_winger: 'Extremo izq.',
  striker: 'Delantero centro',
  second_striker: 'Segunda punta',
}

function positionLabel(position: string | null): string {
  if (!position) return ''
  return POSITION_LABEL[position] ?? position.replace(/_/g, ' ')
}

function TeamColumn({ team }: { team: TeamLineup }) {
  const starters = team.players.filter((p) => p.starter)
  const bench = team.players.filter((p) => !p.starter)

  return (
    <div className="lineup-col">
      <div className="lineup-head">
        <div className="lineup-team">{team.teamName}</div>
        {team.formation ? <span className="lineup-formation">{team.formation}</span> : null}
      </div>
      {team.manager ? <div className="lineup-manager">DT: {team.manager}</div> : null}

      <div className="lineup-group-label">Titulares</div>
      <ul className="lineup-players">
        {starters.map((p) => (
          <li key={`${p.jerseyNumber}-${p.name}`}>
            <span className="lineup-num tnum">{p.jerseyNumber ?? '–'}</span>
            <span className="lineup-name">{p.name}</span>
            <span className="lineup-pos">{positionLabel(p.position)}</span>
          </li>
        ))}
      </ul>

      {bench.length > 0 ? (
        <>
          <div className="lineup-group-label">Suplentes</div>
          <ul className="lineup-players bench">
            {bench.map((p) => (
              <li key={`${p.jerseyNumber}-${p.name}`}>
                <span className="lineup-num tnum">{p.jerseyNumber ?? '–'}</span>
                <span className="lineup-name">{p.name}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

export function Lineups({
  lineups,
  status,
}: {
  lineups: MatchDetail['lineups']
  status: MatchDetail['status']
}) {
  return (
    <div className="detail-card">
      <div className="detail-card-title">Alineaciones</div>

      {!lineups || lineups.length === 0 ? (
        <div className="detail-empty">
          {status === 'SCHEDULED'
            ? 'Sportradar publica las alineaciones confirmadas alrededor de una hora antes del inicio. Volvé más cerca del partido.'
            : 'No hay alineaciones disponibles para este partido.'}
        </div>
      ) : (
        <div className="lineups-grid">
          {lineups
            .slice()
            .sort((a) => (a.qualifier === 'home' ? -1 : 1))
            .map((team) => (
              <TeamColumn team={team} key={team.qualifier} />
            ))}
        </div>
      )}
    </div>
  )
}
