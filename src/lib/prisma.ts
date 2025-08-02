// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // Permet à TypeScript de savoir que `global.prisma` peut exister
  var prisma: PrismaClient | undefined
}

// Évite de créer plusieurs instances en développement
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma