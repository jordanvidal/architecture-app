// scripts/seed-categories.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Création des catégories de prescriptions...')

  const categories = [
    {
      name: 'mobilier',
      description: 'Meubles et éléments d\'ameublement',
      icon: '🛋️',
      colorHex: '#8B5CF6'
    },
    {
      name: 'eclairage',
      description: 'Luminaires et systèmes d\'éclairage',
      icon: '💡',
      colorHex: '#F59E0B'
    },
    {
      name: 'decoration',
      description: 'Objets décoratifs et accessoires',
      icon: '🖼️',
      colorHex: '#EF4444'
    },
    {
      name: 'textile',
      description: 'Tissus, rideaux, coussins et textiles',
      icon: '🧶',
      colorHex: '#10B981'
    },
    {
      name: 'revetement',
      description: 'Revêtements de sols et murs',
      icon: '🧱',
      colorHex: '#6B7280'
    },
    {
      name: 'peinture',
      description: 'Peintures et finitions murales',
      icon: '🎨',
      colorHex: '#3B82F6'
    }
  ]

  for (const categoryData of categories) {
    const category = await prisma.prescriptionCategory.upsert({
      where: { name: categoryData.name },
      update: categoryData,
      create: categoryData
    })

    console.log(`✅ Catégorie "${category.name}" créée`)
  }

  console.log('\n🎉 Catégories créées avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
  