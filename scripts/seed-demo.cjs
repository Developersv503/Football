// Seed de 5 usuarios de demostración + su PredictorProfile, con stats
// variadas para que el ranking global y los rails del frontend tengan
// contenido real (no vacío) desde el primer deploy.
//
// Uso: node --env-file=.env scripts/seed-demo.cjs
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('../packages/db/generated/client/index.js')

const prisma = new PrismaClient()

const DEMO_USERS = [
  { email: 'demo1@pronostico.app', displayName: 'ElOraculo', totalPredictions: 142, correctPredictions: 98, currentStreak: 7 },
  { email: 'demo2@pronostico.app', displayName: 'TacticoFC', totalPredictions: 210, correctPredictions: 131, currentStreak: 3 },
  { email: 'demo3@pronostico.app', displayName: 'MarcadorFrio', totalPredictions: 88, correctPredictions: 61, currentStreak: 12 },
  { email: 'demo4@pronostico.app', displayName: 'PalomitaVIP', totalPredictions: 305, correctPredictions: 172, currentStreak: 0 },
  { email: 'demo5@pronostico.app', displayName: 'RachaSolida', totalPredictions: 56, correctPredictions: 41, currentStreak: 9 },
]

async function main() {
  const passwordHash = await bcrypt.hash('Demo1234!', 12)
  const createdUsers = []

  for (const u of DEMO_USERS) {
    const accuracyBasisPoints = Math.round((u.correctPredictions / u.totalPredictions) * 10000)
    // Score simple: precisión ponderada por volumen — más muestras, más confianza.
    const rankScore = Math.round(accuracyBasisPoints * Math.log10(u.totalPredictions + 1))

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        role: 'USER',
      },
    })

    await prisma.predictorProfile.upsert({
      where: { userId: user.id },
      update: {
        totalPredictions: u.totalPredictions,
        correctPredictions: u.correctPredictions,
        accuracyBasisPoints,
        rankScore,
        currentStreak: u.currentStreak,
      },
      create: {
        userId: user.id,
        totalPredictions: u.totalPredictions,
        correctPredictions: u.correctPredictions,
        accuracyBasisPoints,
        rankScore,
        currentStreak: u.currentStreak,
      },
    })

    createdUsers.push({ id: user.id, displayName: u.displayName })
    console.log(`✓ ${u.displayName} <${u.email}> — rankScore=${rankScore}`)
  }

  // Torneo diario destacado (para el rail del frontend) con los 5 demo
  // users ya anotados con un score de ejemplo.
  const now = new Date()
  const closesAt = new Date(now.getTime() + 5 * 60 * 60 * 1000) // cierra en 5h

  const tournament = await prisma.tournament.upsert({
    where: { id: 'demo-daily-tournament' },
    update: { status: 'ACTIVE', startAt: now, endAt: closesAt },
    create: {
      id: 'demo-daily-tournament',
      name: 'Jornada Diaria',
      type: 'DAILY',
      status: 'ACTIVE',
      startAt: now,
      endAt: closesAt,
      entryFeeCents: 200,
      prizePoolCents: 245000,
    },
  })

  const scores = [312, 287, 265, 240, 198]
  for (let i = 0; i < createdUsers.length; i++) {
    await prisma.tournamentEntry.upsert({
      where: { tournamentId_userId: { tournamentId: tournament.id, userId: createdUsers[i].id } },
      update: { score: scores[i] },
      create: { tournamentId: tournament.id, userId: createdUsers[i].id, score: scores[i] },
    })
  }
  console.log(`✓ Torneo "${tournament.name}" con ${createdUsers.length} participantes de ejemplo`)

  console.log('\nContraseña demo para los 5 usuarios: Demo1234!')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
