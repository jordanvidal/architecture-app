// src/app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        clientName: true,
        status: true,
        budgetTotal: true,
        budgetSpent: true,
        progressPercentage: true,
        createdAt: true,
        imageUrl: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Erreur API projects:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}