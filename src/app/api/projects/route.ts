// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    const project = await prisma.projects.create({
      data: {
        id: require('crypto').randomUUID(),
        name: body.name,
        client_name: body.clientName,
        clientEmails: validEmails,
        projectType: body.projectType || null,
        surfaceM2: body.surfaceM2 ? parseFloat(body.surfaceM2) : null,
        hasExterior: body.hasExterior || false,
        exteriorType: body.exteriorType || null,
        exteriorSurfaceM2: body.exteriorSurfaceM2 ? parseFloat(body.exteriorSurfaceM2) : null,
        address: body.address,
        delivery_contact_name: body.clientName,
        delivery_address: body.address,
        delivery_city: body.city,
        delivery_zip_code: body.zipCode,
        delivery_country: body.country || 'France',
        delivery_access_code: body.accessCode,
        delivery_floor: body.floor,
        delivery_door_code: body.doorCode,
        delivery_instructions: body.deliveryInstructions,
        deliveryFloorInfo: body.floor,
        budget_total: body.budgetTotal ? parseFloat(body.budgetTotal) : null,
        start_date: body.startDate ? new Date(body.startDate) : new Date(),
        end_date: body.endDate ? new Date(body.endDate) : null,
        status: 'BROUILLON',
        progress_percentage: 0,
        created_by: user.id,
        updated_at: new Date()
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

    const projects = await prisma.projects.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: {
            prescriptions: true,
            spaces: true,
            project_files: true
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