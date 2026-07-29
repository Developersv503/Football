import { Global, Module } from '@nestjs/common'
import { prisma } from '@pronostico/db'

export const PRISMA = 'PRISMA'

// Global — un único PrismaClient (singleton exportado por @pronostico/db)
// para todo el proceso. Sin esto, cada módulo que lo importe abriría su
// propio pool contra el pooler de Neon.
@Global()
@Module({
  providers: [{ provide: PRISMA, useValue: prisma }],
  exports: [PRISMA],
})
export class PrismaModule {}
