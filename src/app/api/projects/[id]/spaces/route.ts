// src/app/api/projects/[id]/spaces/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/projects/[id]/spaces - Project ID:', params.id)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que le projet appartient à l'utilisateur
    // ATTENTION: Le champ s'appelle created_by dans la DB, pas createdBy
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        created_by: user.id  // Correct car c'est le nom dans le schéma
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    // Récupérer les espaces
    const spaces = await prisma.space.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`Trouvé ${spaces.length} espaces pour le projet ${params.id}`)

    return NextResponse.json(spaces)
  } catch (error) {
    console.error('Erreur récupération espaces:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des espaces' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        created_by: user.id  // Correct car c'est le nom dans le schéma
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    const body = await request.json()

    const space = await prisma.space.create({
      data: {
        name: body.name,
        type: body.type || 'AUTRE',
        projectId: params.id
      }
    })

    return NextResponse.json(space)
  } catch (error) {
    console.error('Erreur création espace:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'espace' },
      { status: 500 }
    )
  }
}