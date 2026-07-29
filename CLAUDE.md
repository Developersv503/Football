# APP Pronóstico — plataforma de pronósticos deportivos (dinero real, no apuesta tradicional)

> Resumen de lo hablado hasta ahora. Proyecto nuevo, separado de
> `C:\ProjectosDev\Polaris_Google_Cloude\` — reutiliza patrón de stack pero
> es repo/negocio independiente.

## Qué es

Plataforma de pronósticos deportivos con premios en dinero real, como
alternativa a la apuesta tradicional (no es casa de apuestas — el usuario no
apuesta contra la casa, compite en torneos de pronósticos contra otros
usuarios / contra el sistema, premio sale de pool o de comisión).

## Referencia de producto (dada por el cliente)

Cliente quiere estructura de página similar a **stavka.tv** (agregador de
pronósticos ruso, no es casa de apuestas):

- **Sidebar de navegación**: Matches, Torneos de pronósticos, Pronósticos,
  Bonificaciones, Pronosticadores, Casas de apuestas, Artículos.
- **Área principal**: listado de eventos filtrable por fecha/deporte/liga.
  1000+ eventos/día en fútbol, hockey, tenis, básket, esports (CS2, Dota2),
  boxeo, MMA.
- **Tarjeta de evento**: hora, liga, cuotas de referencia de varias casas,
  contador de "N pronósticos" hechos sobre ese partido.
- **Perfil de pronosticador**: historial de aciertos, ranking — es el
  corazón del modelo social/gamificado.
- **Torneos de pronósticos**: competencias con periodo (diario/mensual),
  leaderboard, premio en dinero real al final — esto es el feature central
  del negocio.

## Fuente de datos deportivos: Sportradar

- **https://sportradar.com/** — proveedor oficial, no scraping.
- **Modelo de acceso**: B2B — API no pensada para llamada directa desde
  cliente/frontend. Dos vías:
  - Developer trial self-serve: **https://marketplace.sportradar.com/signup**
  - Enterprise (cliente ya podría tener contrato): Odds, Live Streams, Sports
    Data completo — contacto directo con Sportradar, precio a cotización.
- **Productos relevantes**: Sports Data API (fútbol y demás deportes),
  Odds (cuotas en vivo), Live Streams.
- **Docs**: https://docs.sportradar.com/ (portal general), acceso real vía
  developer portal tras signup en marketplace.

## Arquitectura de datos (decisión ya tomada)

Sportradar es B2B — nunca se llama desde el frontend. Patrón:

```
Sportradar API/feed  →  worker backend (sports-sync, BullMQ)  →  DB propia (Postgres)  →  API interna  →  frontend
```

- API key de Sportradar vive en Secret Manager (GCP) o `.env` no versionado,
  nunca expuesta al cliente.
- Frontend consume **solo tu propia API**, nunca Sportradar directo — evita
  rate-limit propio del proveedor y permite cachear/normalizar datos.
- Módulo `sports-sync`: cron/worker que trae fixtures, resultados, cuotas de
  Sportradar y los guarda normalizados.

## Stack (mismo patrón que Polaris)

- Backend: NestJS + Fastify + Prisma + PostgreSQL, Redis, BullMQ (para
  `sports-sync` y jobs de liquidación de torneos).
- Frontend: (a definir — Polaris usa stack propio, revisar si reusar o Next.js).
- Cloud: Google Cloud (mismo criterio que Polaris — Terraform, nunca
  ClickOps).
- **Regla igual que Polaris**: `terraform apply` / cualquier costo real →
  confirmación explícita del usuario, siempre.

## Módulos de negocio nuevos a diseñar

- `predictions` — pronóstico por usuario/evento, estado
  pending/won/lost/void.
- `tournaments` — competencia con periodo, leaderboard, pool de premio,
  liquidación al cierre.
- `predictor-profiles` — stats históricas, % acierto, ranking, badges.
- `odds-display` — solo lectura, cuotas de Sportradar mostradas como
  referencia informativa (no se opera apuesta real contra ellas — evita
  encuadrar la app como casa de apuestas regulada).
- `sports-sync` — worker que ingiere feed Sportradar (fixtures, resultados,
  cuotas) y normaliza a DB propia.

## Pendiente / próximos pasos

1. Registrar trial en https://marketplace.sportradar.com/signup y obtener
   API key de prueba (fútbol + odds como mínimo).
2. Probar conexión real (curl/Postman) contra un endpoint de fixtures antes
   de tipar schema Prisma — así el modelo de datos se diseña contra
   respuesta real, no genérica.

   **Estado (2026-07-29)**: misma key de la cuenta (`Development` app en el
   dashboard) — al agregar el paquete **Soccer** al mismo application, la
   key no cambió pero ganó acceso al producto correcto. Confirmado real:

   ```
   GET https://api.sportradar.com/soccer/trial/v4/en/competitions.json?api_key=...
   ```
   → 200 OK. Catálogo incluye **LaLiga** (`sr:competition:8`), **Premier
   League** (`sr:competition:17`), **Serie A**, **Ligue 1**, Champions
   League, World Cup — las 4 ligas top que pidió el cliente están
   disponibles. Application sigue teniendo también el paquete Futsal Base
   (no molesta, son productos separados bajo la misma key/app).

   Key guardada en `.env` (`SPORTRADAR_API_KEY`) — trial: quota 1,000
   calls/día, 1 QPS, vence 30 días desde activación. Pendiente: confirmar
   fecha de vencimiento exacta del paquete Soccer en el dashboard (puede
   diferir del Futsal).
3. Confirmar con cliente si ya tiene contrato enterprise propio de
   Sportradar (con key/paquete específico) o si arrancamos con trial
   developer.
4. Decidir stack de frontend (reusar convención Polaris vs. Next.js nuevo).
5. Diseñar schema Prisma de `predictions` + `tournaments` una vez haya
   respuesta real de la API.
6. Definir modelo de negocio de premio (pool entre usuarios vs. comisión de
   plataforma) — impacta lógica de liquidación y aspectos legales/regulatorios
   de "dinero real" (revisar si aplica alguna licencia según jurisdicción del
   cliente).

## Reglas heredadas de Polaris (aplican igual acá)

- Servicios ~150 líneas máx, controllers ~100 líneas máx, una
  responsabilidad por archivo.
- Toda mutación pasa por audit log.
- Nunca exponer credenciales/API keys en frontend ni en el repo (usar
  `.env` + `.gitignore`, o Secret Manager en producción).
- Acciones con costo real (cloud, contratos) → confirmación explícita del
  usuario.
