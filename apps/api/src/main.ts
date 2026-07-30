import { createApp } from './bootstrap'
import { getEnv, isProd } from './config/env'

async function bootstrap(): Promise<void> {
  const app = await createApp()
  const env = getEnv()
  await app.listen(env.PORT, isProd() ? '0.0.0.0' : '127.0.0.1')
  console.log(`API en puerto ${env.PORT} [${env.NODE_ENV}]`)
}

void bootstrap()
