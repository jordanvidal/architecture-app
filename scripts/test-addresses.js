// scripts/test-addresses.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Test de la même requête que l'API
  const projects = await prisma.project.findMany({
    include: {
      deliveryAddress: true,
      billingAddresses: true
    }
  })

  console.log('🔍 Test de la requête API:')
  projects.forEach(project => {
    console.log(`\nProjet: ${project.name}`)
    console.log(`Adresse livraison: ${project.deliveryAddress ? '✅ OUI' : '❌ NON'}`)
    console.log(`Adresses facturation: ${project.billingAddresses.length} trouvée(s)`)
    
    if (project.deliveryAddress) {
      console.log(`  Contact: ${project.deliveryAddress.contactName}`)
      console.log(`  Adresse: ${project.deliveryAddress.address}`)
    }
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