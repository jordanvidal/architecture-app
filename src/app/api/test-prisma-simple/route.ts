// src/app/api/test-prisma-simple/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  let prismaLocal: PrismaClient | null = null
  let prismaImport: any = null
  
  const results: any = {
    timestamp: new Date().toISOString(),
  }
  
  // Test 1: Instance locale directe
  try {
    prismaLocal = new PrismaClient()
    const count = await prismaLocal.user.count()
    results.directInstance = `✅ OK - ${count} users`
  } catch (error: any) {
    results.directInstance = `❌ Error: ${error.message}`
  } finally {
    if (prismaLocal) await prismaLocal.$disconnect()
  }
  
  // Test 2: Import depuis lib/prisma
  try {
    prismaImport = (await import('@/lib/prisma')).default
    const count = await prismaImport.project.count()
    results.libImport = `✅ OK - ${count} projects`
  } catch (error: any) {
    results.libImport = `❌ Error: ${error.message}`
  }
  
  // Test 3: Require depuis lib/prisma
  try {
    const prismaRequire = require('@/lib/prisma').default
    const count = await prismaRequire.project.count()
    results.libRequire = `✅ OK - ${count} projects`
  } catch (error: any) {
    results.libRequire = `❌ Error: ${error.message}`
  }
  
  return NextResponse.json(results)
}