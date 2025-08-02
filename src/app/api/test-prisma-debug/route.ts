// src/app/api/test-prisma-debug/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    tests: {}
  }

  // Test 1: Import direct de PrismaClient
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const userCount = await prisma.user.count()
    debug.tests.directImport = `✅ Success - ${userCount} users`
    await prisma.$disconnect()
  } catch (error: any) {
    debug.tests.directImport = `❌ Error: ${error.message}`
  }

  // Test 2: Import depuis lib/prisma avec require
  try {
    const prisma = require('../../../lib/prisma').default
    const projectCount = await prisma.projects.count()
    debug.tests.libRequire = `✅ Success - ${projectCount} projects`
  } catch (error: any) {
    debug.tests.libRequire = `❌ Error: ${error.message}`
  }

  // Test 3: Import depuis lib/prisma avec import dynamique
  try {
    const module = await import('../../../lib/prisma')
    const prisma = module.default || module.prisma
    const categoryCount = await prisma.prescription_categories.count()
    debug.tests.libDynamicImport = `✅ Success - ${categoryCount} categories`
  } catch (error: any) {
    debug.tests.libDynamicImport = `❌ Error: ${error.message}`
  }

  // Test 4: Vérifier la structure du client Prisma
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    debug.prismaModels = {
      hasUser: !!prisma.user,
      hasProjects: !!prisma.projects,
      hasPrescriptions: !!prisma.prescriptions,
      hasSpaces: !!prisma.spaces,
      availableModels: Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'))
    }
  } catch (error: any) {
    debug.prismaModels = `❌ Error: ${error.message}`
  }

  // Test 5: Variables d'environnement
  debug.env = {
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Defined' : '❌ Not defined',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? '✅ Running on Vercel' : '❌ Not on Vercel'
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}