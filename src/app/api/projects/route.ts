// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrisma } from '@/lib/get-prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const prisma = getPrisma()

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
        client_name: body.clientName,
        clientEmails: validEmails,
        projectType: body.projectType || null,
        surfaceM2: body.surfaceM2 ? parseFloat(body.surfaceM2) : null,
        hasExterior: body.hasExterior || false,
        exteriorType: body.exteriorType || null,
        exteriorSurfaceM2: body.exteriorSurfaceM2 ? parseFloat(body.exteriorSurfaceM2) : null,
        address: body.address || null,
        delivery_contact_name: body.clientName || null,
        delivery_address: body.address || null,
        delivery_city: body.city || null,
        delivery_zip_code: body.zipCode || null,
        delivery_country: body.country || 'France',
        delivery_access_code: body.accessCode || null,
        delivery_floor: body.floor || null,
        delivery_door_code: body.doorCode || null,
        delivery_instructions: body.deliveryInstructions || null,
        deliveryFloorInfo: body.floor || null,
        budget_total: body.budgetTotal ? parseFloat(body.budgetTotal) : null,
        start_date: body.startDate ? new Date(body.startDate) : new Date(),
        end_date: body.endDate ? new Date(body.endDate) : null,
        status: 'BROUILLON',
        progress_percentage: 0,
        created_by: user.id
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

    const prisma = getPrisma()

    const projects = await prisma.project.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: {
            prescriptions: true,
            spaces: true
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