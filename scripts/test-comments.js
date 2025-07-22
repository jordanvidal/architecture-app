// scripts/test-comments.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Test des commentaires...')

  // Vérifier qu'on a des prescriptions
  const prescriptions = await prisma.prescription.findMany({
    take: 1
  })

  if (prescriptions.length === 0) {
    console.log('❌ Aucune prescription trouvée')
    return
  }

  const prescription = prescriptions[0]
  console.log(`📋 Test avec prescription: ${prescription.name} (${prescription.id})`)

  // Vérifier les commentaires existants
  const existingComments = await prisma.prescriptionComment.findMany({
    where: { prescriptionId: prescription.id }
  })

  console.log(`💬 ${existingComments.length} commentaires existants`)

  // URL à tester
  console.log(`🌐 URL API à tester: http://localhost:3000/api/prescriptions/${prescription.id}/comments`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })