import { Inject, Injectable, Logger } from '@nestjs/common'
import type { PrismaClient, AuditAction } from '@pronostico/db'
import { PRISMA } from '../../infrastructure/prisma/prisma.module'

interface AuditEntry {
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  ip: string
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  /** Fire-and-forget: un fallo de auditoría no debe tumbar la respuesta al usuario. */
  log(entry: AuditEntry): void {
    this.prisma.auditLog
      .create({ data: entry })
      .catch((err) => this.logger.error(`No se pudo escribir audit log: ${err.message}`))
  }
}
