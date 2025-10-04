// src/app/api/client/projects/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const projectId = params.id

    // Vérifier que le client a accès au projet
    const hasAccess = await prisma.projectClient.findFirst({
      where: {
        projectId,
        userId: user.id
      }
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès non autorisé à ce projet' }, { status: 403 })
    }

    // Récupérer le projet complet
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        spaces: {
          include: {
            prescriptions: {
              include: {
                category: true
              }
            },
            projectFiles: true
          }
        },
        files: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Transformer les données pour correspondre au format attendu par le frontend
    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      progressPercentage: project.progress_percentage || 0,
      imageUrl: project.image_url,
      spaces: project.spaces.map(space => ({
        ...space,
        prescriptions: space.prescriptions.map(p => ({
          ...p,
          approvals: [], // Pas d'approbations pour l'instant
          comments: []   // Pas de commentaires pour l'instant
        }))
      })),
      files: project.files
    })
  } catch (error) {
    console.error('Erreur chargement projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement du projet' },
      { status: 500 }
    )
  }
}