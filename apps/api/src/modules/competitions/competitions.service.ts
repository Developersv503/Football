import { Inject, Injectable } from '@nestjs/common'
import type { PrismaClient } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'

export interface CompetitionOption {
  id: string
  name: string
  country: string | null
  eventCount: number
}

@Injectable()
export class CompetitionsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  /**
   * Alimenta el filtro de ligas del frontend. Solo devuelve competiciones
   * que tienen al menos un evento — una liga vacía en el selector es una
   * opción que no filtra nada, y con 1.275 competiciones en el catálogo de
   * Sportradar el ruido sería enorme.
   */
  async list(sportKey?: string): Promise<CompetitionOption[]> {
    const rows = await this.prisma.competition.findMany({
      where: {
        ...(sportKey && { sport: { key: sportKey } }),
        events: { some: {} },
      },
      select: {
        id: true,
        name: true,
        country: true,
        _count: { select: { events: true } },
      },
      orderBy: [{ country: 'asc' }, { name: 'asc' }],
    })

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      country: row.country,
      eventCount: row._count.events,
    }))
  }
}
