// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Créer une instance globale pour éviter trop de connexions
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    
    const validEmails = body.clientEmails?.filter((email: string) => email?.trim()) || []

    const project = await prisma.project.create({
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
        status: 'BROUILLON',
        progressPercentage: 0,
        createdBy: user.id
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erreur création projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            prescriptions: true,
            spaces: true,
            files: true
          }
        }
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Erreur récupération projets:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
  }
}