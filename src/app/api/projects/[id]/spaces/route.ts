// src/app/api/projects/[id]/spaces/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const spaces = await prisma.space.findMany({
      where: { projectId: params.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(spaces)
  } catch (error) {
    console.error('Erreur GET spaces:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouvel espace
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { name, type, description, surfaceM2 } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }

    const space = await prisma.space.create({
      data: {
        projectId: params.id,
        name,
        type,
        description,
        surfaceM2: surfaceM2 ? parseFloat(surfaceM2) : null
      }
    })

    return NextResponse.json(space, { status: 201 })
  } catch (error) {
    console.error('Erreur POST space:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}