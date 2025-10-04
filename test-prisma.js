const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  console.log('Test Prisma Client...')
  console.log('prisma =', prisma)
  console.log('prisma.prescriptionCategory =', prisma.prescriptionCategory)
  
  try {
    const count = await prisma.prescriptionCategory.count()
    console.log('✅ Nombre de catégories:', count)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
  
  await prisma.$disconnect()
}

test()