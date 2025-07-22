// scripts/debug-complete.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 DEBUG COMPLET...\n')

  // 1. Vérifier la base
  console.log('1️⃣ BASE DE DONNÉES:')
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, imageUrl: true }
  })
  
  projects.forEach(p => {
    console.log(`   ${p.name}: ${p.imageUrl ? '✅ A une image' : '❌ Pas d\'image'}`)
  })

  // 2. Simuler l'API
  console.log('\n2️⃣ SIMULATION API:')
  const apiResult = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      clientName: true,
      status: true,
      budgetTotal: true,
      budgetSpent: true,
      progressPercentage: true,
      createdAt: true,
      imageUrl: true
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`   Nombre de projets retournés: ${apiResult.length}`)
  apiResult.forEach(p => {
    console.log(`   ${p.name}: imageUrl = "${p.imageUrl}"`)
  })

  // 3. Test d'une image simple
  console.log('\n3️⃣ METTRE UNE IMAGE SIMPLE:')
  await prisma.project.updateMany({
    where: { name: 'Villa Moderne' },
    data: { imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WaWxsYSBNb2Rlcm5lPC90ZXh0Pjwvc3ZnPg==' }
  })
  console.log('   ✅ Image SVG inline ajoutée à Villa Moderne')

  console.log('\n🎯 TESTEZ MAINTENANT:')
  console.log('   1. Rechargez http://localhost:3000/projects')
  console.log('   2. Ouvrez la console (F12)')
  console.log('   3. Regardez si vous voyez "🔍 Projets reçus"')
  console.log('   4. Villa Moderne devrait avoir une image grise avec du texte')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })