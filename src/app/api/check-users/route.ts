// src/app/api/check-users/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const prisma = new PrismaClient()
    
    // Récupérer tous les utilisateurs (sans les mots de passe)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true, // On vérifie juste si c'est null ou pas
        createdAt: true
      }
    })
    
    // Transformer pour masquer les mots de passe
    const usersInfo = users.map(user => ({
      ...user,
      hasPassword: !!user.password,
      password: undefined // On enlève le mot de passe de la réponse
    }))
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      count: users.length,
      users: usersInfo
    })
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs', details: error.message },
      { status: 500 }
    )
  }
}