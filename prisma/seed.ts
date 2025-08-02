// prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed des catégories...')

  const categories = [
    {
      name: 'Mobilier',
      icon: '🪑',
      colorHex: '#8B5CF6',
      description: 'Canapés, tables, chaises, bureaux, rangements'
    },
    {
      name: 'Luminaire',
      icon: '💡',
      colorHex: '#F59E0B',
      description: 'Suspensions, lampadaires, appliques, spots'
    },
    {
      name: 'Textile',
      icon: '🧵',
      colorHex: '#10B981',
      description: 'Rideaux, coussins, tapis, plaids, linge de maison'
    },
    {
      name: 'Décoration',
      icon: '🖼️',
      colorHex: '#3B82F6',
      description: 'Tableaux, miroirs, vases, objets décoratifs'
    },
    {
      name: 'Électroménager',
      icon: '🔌',
      colorHex: '#EF4444',
      description: 'Appareils de cuisine, électronique'
    },
    {
      name: 'Sanitaire',
      icon: '🚿',
      colorHex: '#06B6D4',
      description: 'Robinetterie, vasques, douches, baignoires'
    },
    {
      name: 'Revêtement',
      icon: '🏠',
      colorHex: '#6366F1',
      description: 'Parquet, carrelage, papier peint, peinture'
    }
  ]

  for (const category of categories) {
    const existingCategory = await prisma.prescriptionsCategory.findUnique({
      where: { name: category.name }
    })

    if (!existingCategory) {
      await prisma.prescriptionsCategory.create({
        data: category
      })
      console.log(`✅ Catégorie "${category.name}" créée`)
    } else {
      console.log(`⏭️  Catégorie "${category.name}" existe déjà`)
    }
  }

  console.log('🎉 Seed des catégories terminé!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })