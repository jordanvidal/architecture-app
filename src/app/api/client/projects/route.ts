// app/api/client/projects/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que c'est bien un client
    if (user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les projets accessibles au client
    const projectClients = await prisma.projectClient.findMany({
      where: {
        userId: user.id
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            progressPercentage: true,
            imageUrl: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const projects = projectClients.map(pc => ({
      ...pc.project,
      progressPercentage: pc.project.progressPercentage || 0
    }))

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Erreur chargement projets client:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des projets' },
      { status: 500 }
    )
  }
}