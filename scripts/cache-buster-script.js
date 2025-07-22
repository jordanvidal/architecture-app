// scripts/add-cache-buster.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Ajout de cache-buster aux images...')

  const projects = await prisma.project.findMany({
    select: { id: true, name: true, imageUrl: true }
  })

  const timestamp = Date.now()

  for (const project of projects) {
    if (project.imageUrl && project.imageUrl.startsWith('/images/projects/')) {
      const newUrl = `${project.imageUrl}?v=${timestamp}`
      
      await prisma.project.update({
        where: { id: project.id },
        data: { imageUrl: newUrl }
      })

      console.log(`✅ ${project.name}: ${newUrl}`)
    }
  }

  console.log('\n🎯 Cache-buster ajouté! Rechargez la page.')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })