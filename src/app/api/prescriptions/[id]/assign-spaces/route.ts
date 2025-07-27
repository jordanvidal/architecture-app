// src/app/api/prescriptions/[id]/assign-space/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT /api/prescriptions/[id]/assign-space - Associer une prescription à un espace
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const prescriptionId = params.id
    const body = await request.json()
    const { spaceId } = body

    // Vérifier que la prescription existe et appartient à l'utilisateur
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        creator: { id: session.user.id }
      },
      include: {
        project: true
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription non trouvée' }, { status: 404 })
    }

    // Si spaceId est fourni, vérifier que l'espace appartient au même projet
    if (spaceId) {
      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
          projectId: prescription.projectId
        }
      })

      if (!space) {
        return NextResponse.json(
          { error: 'Espace non trouvé ou ne correspond pas au projet' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour la prescription
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        spaceId: spaceId || null
      },
      include: {
        space: true,
        category: true,
        creator: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    return NextResponse.json(updatedPrescription)
  } catch (error) {
    console.error('Erreur association prescription-espace:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET /api/prescriptions/unassigned/[projectId] - Récupérer prescriptions non assignées
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projectId = params.projectId

    // Vérifier l'accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        creator: { id: session.user.id }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Récupérer les prescriptions sans espace assigné
    const unassignedPrescriptions = await prisma.prescription.findMany({
      where: {
        projectId,
        spaceId: null
      },
      include: {
        category: true,
        creator: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(unassignedPrescriptions)
  } catch (error) {
    console.error('Erreur récupération prescriptions non assignées:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}