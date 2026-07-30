import type { IncomingMessage, ServerResponse } from 'http'
import { createApp } from '../src/bootstrap'

// Fluid Compute reusa instancias tibias entre invocaciones — cachear la app
// acá evita re-bootstrapear Nest (y reabrir el pool de Prisma) en cada
// request.
let readyServer: ReturnType<typeof getFastifyServer> | null = null

async function getFastifyServer() {
  const app = await createApp()
  await app.init()
  const fastify = app.getHttpAdapter().getInstance()
  await fastify.ready()
  return fastify.server
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!readyServer) readyServer = getFastifyServer()
  const server = await readyServer
  server.emit('request', req, res)
}
