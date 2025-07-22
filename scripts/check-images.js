// scripts/check-images.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Vérification des images en base...')

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  })

  projects.forEach(project => {
    console.log(`📋 ${project.name}:`)
    console.log(`   ImageURL: ${project.imageUrl || 'AUCUNE IMAGE'}`)
    console.log(`   ID: ${project.id}\n`)
  })

  console.log(`📊 ${projects.length} projets vérifiés`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })