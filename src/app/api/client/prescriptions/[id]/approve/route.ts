// app/api/client/prescriptions/[id]/approve/route.ts

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

    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const prescriptionId = params.id

    // Vérifier que la prescription existe et que le client a accès au projet
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        project: {
          include: {
            clientAccess: {
              where: { userId: user.id }
            }
          }
        }
      }
    })

    if (!prescription || prescription.project.clientAccess.length === 0) {
      return NextResponse.json({ error: 'Prescription non accessible' }, { status: 403 })
    }

    // Créer ou mettre à jour l'approbation
    const approval = await prisma.prescriptionApproval.upsert({
      where: {
        prescriptionId_userId: {
          prescriptionId,
          userId: user.id
        }
      },
      create: {
        prescriptionId,
        userId: user.id,
        status: 'APPROVED'
      },
      update: {
        status: 'APPROVED',
        updatedAt: new Date()
      }
    })

    // Récupérer l'architecte créateur du projet
    const architect = await prisma.user.findUnique({
      where: { id: prescription.project.created_by }
    })

    if (architect) {
      // Créer une notification pour l'architecte
      await prisma.notification.create({
        data: {
          type: 'PRESCRIPTION_APPROVED',
          senderId: user.id,
          receiverId: architect.id,
          content: `${user.firstName || user.email} a approuvé la prescription "${prescription.name}"`,
          metadata: {
            prescriptionId: prescription.id,
            projectId: prescription.projectId,
            projectName: prescription.project.name
          }
        }
      })
    }

    return NextResponse.json({ approval })
  } catch (error) {
    console.error('Erreur approbation prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'approbation' },
      { status: 500 }
    )
  }
}