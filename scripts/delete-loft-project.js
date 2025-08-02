// scripts/delete-loft.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Suppression du projet "Loft Industriel"...\n')

  // Trouver le projet
  const loftProject = await prisma.project.findFirst({
    where: { name: 'Loft Industriel' }
  })

  if (!loftProject) {
    console.log('❌ Projet "Loft Industriel" non trouvé')
    return
  }

  console.log(`📋 Projet trouvé: ${loftProject.name} (ID: ${loftProject.id})`)

  // Supprimer toutes les données liées en cascade
  console.log('\n🧹 Suppression des données liées...')

  // 1. Supprimer les commentaires de prescriptions
  const deletedComments = await prisma.prescriptionsComment.deleteMany({
    where: {
      prescription: {
        projectId: loftProject.id
      }
    }
  })
  console.log(`   ✅ ${deletedComments.count} commentaires de prescriptions supprimés`)

  // 2. Supprimer les prescriptions
  const deletedPrescriptions = await prisma.prescriptions.deleteMany({
    where: { projectId: loftProject.id }
  })
  console.log(`   ✅ ${deletedPrescriptions.count} prescriptions supprimées`)

  // 3. Supprimer les espaces
  const deletedSpaces = await prisma.spaces.deleteMany({
    where: { projectId: loftProject.id }
  })
  console.log(`   ✅ ${deletedSpaces.count} espaces supprimés`)

  // 4. Supprimer les adresses de facturation
  const deletedBilling = await prisma.billingAddress.deleteMany({
    where: { projectId: loftProject.id }
  })
  console.log(`   ✅ ${deletedBilling.count} adresses de facturation supprimées`)

  // 5. Supprimer l'adresse de livraison
  const deletedDelivery = await prisma.deliveryAddress.deleteMany({
    where: { projectId: loftProject.id }
  })
  console.log(`   ✅ ${deletedDelivery.count} adresse de livraison supprimée`)

  // 6. Enfin, supprimer le projet lui-même
  await prisma.project.delete({
    where: { id: loftProject.id }
  })
  console.log(`   ✅ Projet "${loftProject.name}" supprimé`)

  console.log('\n🎉 Suppression terminée!')
  console.log('💡 Rechargez http://localhost:3000/projects pour voir le changement')

  // Afficher les projets restants
  const remainingProjects = await prisma.project.findMany({
    select: { name: true }
  })
  console.log(`\n📊 Projets restants (${remainingProjects.length}):`)
  remainingProjects.forEach(p => {
    console.log(`   - ${p.name}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })