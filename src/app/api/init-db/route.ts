// src/app/api/init-db/route.ts
// VERSION TEMPORAIRE POUR DEBUGGER
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  // Test simple de connexion sans authentification
  try {
    const dbUrl = process.env.DATABASE_URL || 'NOT SET'
    const directUrl = process.env.DIRECT_URL || 'NOT SET'
    
    // Masquer le mot de passe pour le log
    const maskPassword = (url: string) => {
      if (url === 'NOT SET') return url
      return url.replace(/:([^@]+)@/, ':****@')
    }
    
    console.log('DATABASE_URL:', maskPassword(dbUrl))
    console.log('DIRECT_URL:', maskPassword(directUrl))
    
    const prisma = new PrismaClient()
    
    // Test de connexion
    const userCount = await prisma.User.count()
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Connexion DB réussie!',
      userCount,
      dbConfigured: dbUrl !== 'NOT SET',
      directUrlConfigured: directUrl !== 'NOT SET'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    
    // Protection basique
    if (secret !== 'votre-secret-temporaire-12345') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }
    
    const prisma = new PrismaClient()
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Demo2024!', 10)
    
    // Créer l'utilisateur
    const user = await prisma.User.upsert({
      where: { email: 'marie.dubois@agence.com' },
      update: {},
      create: {
        email: 'marie.dubois@agence.com',
        firstName: 'Marie',
        lastName: 'Dubois',
        password: hashedPassword,
        role: 'AGENCY',
        emailVerified: new Date(),
      },
    })
    
    // Créer les catégories
    const categories = [
      { name: 'Mobilier', colorHex: '#3B82F6', icon: '🪑' },
      { name: 'Luminaire', colorHex: '#10B981', icon: '💡' },
      { name: 'Décoration', colorHex: '#F59E0B', icon: '🖼️' },
      { name: 'Revêtement', colorHex: '#8B5CF6', icon: '🎨' },
      { name: 'Équipement', colorHex: '#EF4444', icon: '🔧' },
    ]
    
    for (const cat of categories) {
      await prisma.prescriptionsCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      })
    }
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      message: 'Base de données initialisée avec succès! Utilisateur: marie.dubois@agence.com / Mot de passe: Demo2024!'
    })
  } catch (error) {
    console.error('Erreur init DB:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'initialisation' },
      { status: 500 }
    )
  }
}