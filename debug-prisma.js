const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

console.log('Modèles Prisma disponibles:')
console.log(Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')))

prisma.$disconnect()