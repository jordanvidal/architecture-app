// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  let prisma: PrismaClient | null = null
  
  try {
    // Log les variables (sans les mots de passe)
    const dbUrl = process.env.DATABASE_URL || 'NOT SET'
    const hasDbUrl = dbUrl !== 'NOT SET'
    const urlParts = hasDbUrl ? dbUrl.split('@') : []
    const serverInfo = urlParts.length > 1 ? urlParts[1].split('/')[0] : 'Unknown'
    
    console.log('Database URL configured:', hasDbUrl)
    console.log('Server:', serverInfo)
    
    // Tenter la connexion
    prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
    
    // Test simple - compter les utilisateurs
    const userCount = await prisma.User.count()
    
    return NextResponse.json({ 
      success: true,
      message: 'Connexion réussie!',
      userCount,
      server: serverInfo
    })
    
  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    
    return NextResponse.json({ 
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message,
      code: error.code,
      meta: error.meta
    }, { status: 500 })
    
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}