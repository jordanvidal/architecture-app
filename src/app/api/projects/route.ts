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

    const project = await prisma.project.create({
      data: {
        name: body.name,
        client_name: body.clientName, // Notez: client_name au lieu de clientName
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
        created_by: user.id // Notez: created_by au lieu de createdBy
      }
    })

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedProject = {
      ...project,
      clientName: project.client_name,
      budgetTotal: project.budget_total,
      budgetSpent: project.budget_spent,
      progressPercentage: project.progress_percentage,
      startDate: project.start_date,
      endDate: project.end_date,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }

    return NextResponse.json(formattedProject)
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

    // Récupérer l'utilisateur actuel
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Filtrer les projets par l'utilisateur connecté
    const projects = await prisma.project.findMany({
      where: {
        created_by: user.id // Filtrer par créateur
      },
      orderBy: { created_at: 'desc' },
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

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedProjects = projects.map(project => ({
      ...project,
      clientName: project.client_name,
      budgetTotal: project.budget_total,
      budgetSpent: project.budget_spent,
      progressPercentage: project.progress_percentage,
      startDate: project.start_date,
      endDate: project.end_date,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error('Erreur récupération projets:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
  }
}