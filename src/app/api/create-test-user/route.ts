// src/app/api/create-test-user/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, secret } = await request.json()
    
    // Protection basique
    if (secret !== 'votre-secret-temporaire-12345') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }
    
    const prisma = new PrismaClient()
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.User.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        message: 'Un utilisateur avec cet email existe déjà' 
      }, { status: 400 })
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Créer l'utilisateur
    const user = await prisma.User.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'CLIENT', // ou 'AGENCY' si vous voulez
        emailVerified: new Date(),
      },
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      message: `Utilisateur créé avec succès! Email: ${email}`,
      userId: user.id
    })
    
  } catch (error: any) {
    console.error('Erreur création utilisateur:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création', error: error.message },
      { status: 500 }
    )
  }
}