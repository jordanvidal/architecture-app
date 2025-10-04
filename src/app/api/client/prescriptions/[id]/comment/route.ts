// app/api/client/prescriptions/[id]/comment/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
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

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const prescriptionId = params.id
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Le commentaire ne peut pas être vide' }, { status: 400 })
    }

    // Vérifier que la prescription existe
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        project: {
          include: {
            clientAccess: user.role === 'CLIENT' ? {
              where: { userId: user.id }
            } : undefined
          }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription non trouvée' }, { status: 404 })
    }

    // Vérifier les permissions
    if (user.role === 'CLIENT' && prescription.project.clientAccess?.length === 0) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (user.role === 'ARCHITECT' && prescription.project.created_by !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Créer le commentaire
    const comment = await prisma.prescriptionComment.create({
      data: {
        prescriptionId,
        userId: user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    // Notifier la partie opposée (architecte si client commente, ou client si architecte commente)
    let receiverId: string | null = null

    if (user.role === 'CLIENT') {
      // Notifier l'architecte
      receiverId = prescription.project.created_by
    } else if (user.role === 'ARCHITECT') {
      // Notifier le client (prendre le premier client ayant accès)
      const clientAccess = await prisma.projectClient.findFirst({
        where: { projectId: prescription.projectId }
      })
      receiverId = clientAccess?.userId || null
    }

    if (receiverId && receiverId !== user.id) {
      await prisma.notification.create({
        data: {
          type: 'PRESCRIPTION_COMMENTED',
          senderId: user.id,
          receiverId,
          content: `${user.firstName || user.email} a commenté la prescription "${prescription.name}"`,
          metadata: {
            prescriptionId: prescription.id,
            projectId: prescription.projectId,
            projectName: prescription.project.name,
            commentContent: content.trim().substring(0, 100)
          }
        }
      })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Erreur création commentaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    )
  }
}