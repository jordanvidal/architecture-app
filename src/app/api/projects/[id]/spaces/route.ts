// src/app/api/projects/[id]/spaces/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/projects/[id]/spaces - Récupérer tous les espaces d'un projet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projectId = params.id

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        creator: { id: session.user.id }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Récupérer les espaces avec le nombre de prescriptions
    const spaces = await prisma.spaces.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { prescriptions: true }
        }
      },
      orderBy: { created_at: 'asc' }
    })

    return NextResponse.json(spaces)
  } catch (error) {
    console.error('Erreur récupération espaces:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/spaces - Créer un nouvel espace
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projectId = params.id
    const body = await request.json()
    const { name, type, description, surfaceM2 } = body

    // Validation des données
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nom et type requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        creator: { id: session.user.id }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Créer l'espace
    const newSpace = await prisma.spaces.create({
      data: {
        name,
        type,
        description,
        surfaceM2: surfaceM2 ? parseFloat(surfaceM2) : null,
        projectId
      },
      include: {
        _count: {
          select: { prescriptions: true }
        }
      }
    })

    return NextResponse.json(newSpace, { status: 201 })
  } catch (error) {
    console.error('Erreur création espace:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}