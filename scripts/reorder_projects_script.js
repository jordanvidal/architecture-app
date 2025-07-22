// scripts/reorder-projects.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Réorganisation de l\'ordre des projets...\n')

  // Ordre souhaité : Villa Moderne en premier
  const newOrder = [
    'Villa Moderne',      // En premier
    'Appartement Parisien',
    'Maison Familiale'
  ]

  // Calculer les nouvelles dates pour l'ordre
  const baseDate = new Date('2025-01-01')
  
  for (let i = 0; i < newOrder.length; i++) {
    const projectName = newOrder[i]
    // Plus la date est récente, plus le projet apparaît en premier
    const newDate = new Date(baseDate.getTime() + (newOrder.length - i) * 24 * 60 * 60 * 1000)
    
    const result = await prisma.project.updateMany({
      where: { name: projectName },
      data: { createdAt: newDate }
    })

    if (result.count > 0) {
      console.log(`✅ ${projectName}: Position ${i + 1} (${newDate.toLocaleDateString('fr-FR')})`)
    } else {
      console.log(`❌ Projet "${projectName}" non trouvé`)
    }
  }

  console.log('\n🎉 Ordre mis à jour!')
  console.log('📋 Nouvel ordre:')
  newOrder.forEach((name, index) => {
    console.log(`   ${index + 1}. ${name}`)
  })

  console.log('\n💡 Rechargez http://localhost:3000/projects pour voir le changement')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })