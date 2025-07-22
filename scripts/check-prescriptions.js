// scripts/check-prescriptions.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Vérification des prescriptions...')

  const prescriptions = await prisma.prescription.findMany({
    include: {
      project: true,
      space: true,
      category: true
    }
  })

  console.log(`📊 ${prescriptions.length} prescriptions trouvées`)

  if (prescriptions.length > 0) {
    console.log('\n📋 Détail des prescriptions:')
    prescriptions.forEach(p => {
      console.log(`  - ${p.name} (${p.project.name} - ${p.space.name})`)
    })

    // Tester la requête de l'API
    const firstProject = prescriptions[0].project
    console.log(`\n🎯 Test pour projet: ${firstProject.name} (${firstProject.id})`)
    
    const projectPrescriptions = await prisma.prescription.findMany({
      where: { 
        projectId: firstProject.id 
      },
      include: {
        space: true,
        category: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    console.log(`📊 ${projectPrescriptions.length} prescriptions pour ce projet`)
    console.log(`🌐 URL à tester: http://localhost:3000/api/projects/${firstProject.id}/prescriptions`)
  } else {
    console.log('❌ Aucune prescription trouvée!')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })