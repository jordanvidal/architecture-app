// src/app/api/spaces/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/get-prisma'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/spaces/[id] - Récupérer un espace spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const spaceId = params.id

    const space = await prisma.spaces.findFirst({
      where: {
        id: spaceId,
        project: {
          creator: { id: session.user.id }
        }
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        prescriptions: {
          include: {
            category: true,
            creator: {
              select: { firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { created_at: 'desc' }
        },
        _count: {
          select: { prescriptions: true }
        }
      }
    })

    if (!space) {
      return NextResponse.json({ error: 'Espace non trouvé' }, { status: 404 })
    }

    return NextResponse.json(space)
  } catch (error) {
    console.error('Erreur récupération espace:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/spaces/[id] - Modifier un espace
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const spaceId = params.id
    const body = await request.json()
    const { name, type, description, surfaceM2 } = body

    // Vérifier que l'espace existe et appartient à l'utilisateur
    const existingSpace = await prisma.spaces.findFirst({
      where: {
        id: spaceId,
        project: {
          creator: { id: session.user.id }
        }
      }
    })

    if (!existingSpace) {
      return NextResponse.json({ error: 'Espace non trouvé' }, { status: 404 })
    }

    // Mettre à jour l'espace
    const updatedSpace = await prisma.spaces.update({
      where: { id: spaceId },
      data: {
        name: name || existingSpace.name,
        type: type || existingSpace.type,
        description: description !== undefined ? description : existingSpace.description,
        surfaceM2: surfaceM2 !== undefined ? (surfaceM2 ? parseFloat(surfaceM2) : null) : existingSpace.surfaceM2
      },
      include: {
        _count: {
          select: { prescriptions: true }
        }
      }
    })

    return NextResponse.json(updatedSpace)
  } catch (error) {
    console.error('Erreur modification espace:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/spaces/[id] - Supprimer un espace
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const spaceId = params.id

    // Vérifier que l'espace existe et appartient à l'utilisateur
    const existingSpace = await prisma.spaces.findFirst({
      where: {
        id: spaceId,
        project: {
          creator: { id: session.user.id }
        }
      },
      include: {
        _count: {
          select: { prescriptions: true }
        }
      }
    })

    if (!existingSpace) {
      return NextResponse.json({ error: 'Espace non trouvé' }, { status: 404 })
    }

    // Vérifier s'il y a des prescriptions liées
    if (existingSpace._count.prescriptions > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer l'espace: ${existingSpace._count.prescriptions} prescription(s) associée(s)` },
        { status: 400 }
      )
    }

    // Supprimer l'espace
    await prisma.spaces.delete({
      where: { id: spaceId }
    })

    return NextResponse.json({ message: 'Espace supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression espace:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}