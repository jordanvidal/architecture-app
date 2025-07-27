// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Ceci évite de créer plusieurs instances de PrismaClient en développement
// ce qui peut causer des problèmes de connexion à la base de données