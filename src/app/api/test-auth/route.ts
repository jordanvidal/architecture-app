// src/app/api/test-auth/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const prisma = new PrismaClient()
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      })
    }
    
    if (!user.password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Utilisateur sans mot de passe' 
      })
    }
    
    // Tester la comparaison du mot de passe
    console.log('Test de comparaison:')
    console.log('- Email:', email)
    console.log('- Password reçu:', password)
    console.log('- Hash en DB:', user.password.substring(0, 20) + '...')
    
    // Test avec bcrypt
    const isValidBcrypt = await bcrypt.compare(password, user.password)
    console.log('- Résultat bcrypt.compare:', isValidBcrypt)
    
    // Test avec bcryptjs (au cas où)
    const bcryptjs = require('bcryptjs')
    const isValidBcryptjs = await bcryptjs.compare(password, user.password)
    console.log('- Résultat bcryptjs.compare:', isValidBcryptjs)
    
    // Créer un nouveau hash pour comparer
    const newHash = await bcrypt.hash(password, 10)
    console.log('- Nouveau hash généré:', newHash.substring(0, 20) + '...')
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: isValidBcrypt || isValidBcryptjs,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      },
      debug: {
        bcryptResult: isValidBcrypt,
        bcryptjsResult: isValidBcryptjs,
        hashPrefix: user.password.substring(0, 7),
        hashLength: user.password.length
      }
    })
    
  } catch (error: any) {
    console.error('Erreur test auth:', error)
    return NextResponse.json(
      { error: 'Erreur lors du test', details: error.message },
      { status: 500 }
    )
  }
}