import { PrismaClient } from '../generated/client'

export * from '../generated/client'

// Singleton — evita agotar el pool de Neon con un PrismaClient nuevo por
// import (problema clásico en dev con hot-reload; también protege prod
// si algún módulo importa este paquete más de una vez).
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined
}

export const prisma: PrismaClient = globalThis.__prismaClient ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma
}
