// src/app/api/spaces/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PUT /api/spaces/[id] - Modifier un espace
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.User.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const spaceId = params.id
    const body = await request.json()
    const { name, type, description, surfaceM2 } = body

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nom et type requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'espace existe et appartient à un projet de l'utilisateur
    const space = await prisma.spaces.findFirst({
      where: {
        id: spaceId,
        project: {
          created_by: user.id
        }
      }
    })

    if (!space) {
      return NextResponse.json({ error: 'Espace non trouvé' }, { status: 404 })
    }

    // Mettre à jour l'espace
    const updatedSpace = await prisma.spaces.update({
      where: { id: spaceId },
      data: {
        name,
        type,
        description: description || null,
        surfaceM2: surfaceM2 ? parseFloat(surfaceM2) : null
      },
      include: {
        _count: {
          select: { prescriptions: true }
        }
      }
    })

    return NextResponse.json(updatedSpace)
  } catch (error) {
    console.error('Erreur mise à jour espace:', error)
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.User.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const spaceId = params.id

    // Vérifier que l'espace existe et appartient à un projet de l'utilisateur
    const space = await prisma.spaces.findFirst({
      where: {
        id: spaceId,
        project: {
          created_by: user.id
        }
      },
      include: {
        _count: {
          select: { prescriptions: true }
        }
      }
    })

    if (!space) {
      return NextResponse.json({ error: 'Espace non trouvé' }, { status: 404 })
    }

    // Empêcher la suppression si l'espace contient des prescriptions
    if (space._count.prescriptions > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : cet espace contient ${space._count.prescriptions} prescription(s)` },
        { status: 400 }
      )
    }

    // Supprimer l'espace
    await prisma.spaces.delete({
      where: { id: spaceId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression espace:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}