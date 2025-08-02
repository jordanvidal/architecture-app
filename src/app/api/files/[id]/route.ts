// src/app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { unlink } from 'fs/promises'
import path from 'path'

// GET /api/files/[id] - Récupérer un fichier spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const fileId = params.id

    const file = await prisma.project_files.findFirst({
      where: {
        id: fileId,
        project: {
          creator: { id: session.user.id }
        }
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        space: {
          select: { id: true, name: true, type: true }
        },
        uploader: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    return NextResponse.json(file)
  } catch (error) {
    console.error('Erreur récupération fichier:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/files/[id] - Modifier un fichier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const fileId = params.id
    const body = await request.json()
    const { name, description, category, spaceId } = body

    // Vérifier que le fichier existe et appartient à l'utilisateur
    const existingFile = await prisma.project_files.findFirst({
      where: {
        id: fileId,
        project: {
          creator: { id: session.user.id }
        }
      }
    })

    if (!existingFile) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Mettre à jour le fichier
    const updatedFile = await prisma.project_files.update({
      where: { id: fileId },
      data: {
        name: name || existingFile.name,
        description: description !== undefined ? description : existingFile.description,
        category: category || existingFile.category,
        spaceId: spaceId !== undefined ? spaceId : existingFile.spaceId
      },
      include: {
        space: {
          select: { id: true, name: true, type: true }
        },
        uploader: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    return NextResponse.json(updatedFile)
  } catch (error) {
    console.error('Erreur modification fichier:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/files/[id] - Supprimer un fichier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const fileId = params.id

    // Vérifier que le fichier existe et appartient à l'utilisateur
    const existingFile = await prisma.project_files.findFirst({
      where: {
        id: fileId,
        project: {
          creator: { id: session.user.id }
        }
      }
    })

    if (!existingFile) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Supprimer le fichier physique
    try {
      const filePath = path.join(process.cwd(), 'public', existingFile.url)
      await unlink(filePath)
    } catch (fsError) {
      console.warn('Fichier physique non trouvé:', existingFile.url)
    }

    // Supprimer de la base de données
    await prisma.project_files.delete({
      where: { id: fileId }
    })

    return NextResponse.json({ message: 'Fichier supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression fichier:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}