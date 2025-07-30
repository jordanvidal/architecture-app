// src/app/api/projects/[id]/route.ts
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
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        spaces: true,
        prescriptions: {
          include: {
            category: true,
            space: true,
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        files: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    const projectWithLegacy = {
      ...project,
      clientEmail: project.clientEmails?.[0] || project.clientEmail,
      deliveryAddress: project.deliveryAddress ? {
        contactName: project.deliveryContactName,
        address: project.deliveryAddress,
        city: project.deliveryCity,
        zipCode: project.deliveryZipCode,
        country: project.deliveryCountry,
        accessCode: project.deliveryAccessCode,
        floor: project.deliveryFloor,
        doorCode: project.deliveryDoorCode,
        instructions: project.deliveryInstructions
      } : null
    }

    return NextResponse.json(projectWithLegacy)
  } catch (error) {
    console.error('Erreur récupération projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du projet' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    
    const validEmails = body.clientEmails?.filter((email: string) => email?.trim()) || []

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name,
        clientName: body.clientName,
        clientEmails: validEmails,
        projectType: body.projectType || null,
        surfaceM2: body.surfaceM2 ? parseFloat(body.surfaceM2) : null,
        hasExterior: body.hasExterior || false,
        exteriorType: body.exteriorType || null,
        exteriorSurfaceM2: body.exteriorSurfaceM2 ? parseFloat(body.exteriorSurfaceM2) : null,
        address: body.address,
        deliveryContactName: body.clientName,
        deliveryAddress: body.address,
        deliveryCity: body.city,
        deliveryZipCode: body.zipCode,
        deliveryCountry: body.country || 'France',
        deliveryAccessCode: body.accessCode,
        deliveryFloor: body.floor,
        deliveryDoorCode: body.doorCode,
        deliveryInstructions: body.deliveryInstructions,
        deliveryFloorInfo: body.floor,
        budgetTotal: body.budgetTotal ? parseFloat(body.budgetTotal) : null,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erreur mise à jour projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    )
  }
}