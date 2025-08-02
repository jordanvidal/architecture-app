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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const project = await prisma.projects.findFirst({
      where: { 
        id: params.id,
        created_by: user.id // Vérifier que l'utilisateur est le créateur
      },
      include: {
        spaces: true,
        prescriptions: {
          include: {
            prescription_categories: true,
            spaces: true,
            User: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        project_files: true,
        User: {
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

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.client_name,
      clientEmail: project.clientEmails?.[0] || project.client_email,
      clientEmails: project.clientEmails,
      address: project.address,
      status: project.status,
      budgetTotal: project.budget_total,
      budgetSpent: project.budget_spent,
      progressPercentage: project.progress_percentage,
      startDate: project.start_date,
      endDate: project.end_date,
      imageUrl: project.image_url,
      created_at: project.created_at,
      updated_at: project.updated_at,
      projectType: project.projectType,
      surfaceM2: project.surfaceM2,
      hasExterior: project.hasExterior,
      exteriorType: project.exteriorType,
      exteriorSurfaceM2: project.exteriorSurfaceM2,
      deliveryAddress: project.delivery_address ? {
        contactName: project.delivery_contact_name,
        company: project.delivery_company,
        address: project.delivery_address,
        city: project.delivery_city,
        zipCode: project.delivery_zip_code,
        country: project.delivery_country,
        accessCode: project.delivery_access_code,
        floor: project.delivery_floor,
        doorCode: project.delivery_door_code,
        instructions: project.delivery_instructions
      } : null,
      billingAddresses: project.billing_addresses,
      spaces: project.spaces,
      prescriptions: project.prescriptions.map(p => ({
        ...p,
        category: p.prescription_categories,
        space: p.spaces,
        creator: p.User
      })),
      files: project.project_files,
      creator: project.User,
      _count: {
        prescriptions: project.prescriptions.length,
        spaces: project.spaces.length,
        files: project.project_files.length
      }
    }

    return NextResponse.json(formattedProject)
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le créateur du projet
    const existingProject = await prisma.projects.findFirst({
      where: {
        id: params.id,
        created_by: user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    const body = await request.json()
    
    const validEmails = body.clientEmails?.filter((email: string) => email?.trim()) || []

    const project = await prisma.projects.update({
      where: { id: params.id },
      data: {
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
      }
    })

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.client_name,
      clientEmail: project.clientEmails?.[0] || project.client_email,
      clientEmails: project.clientEmails,
      address: project.address,
      status: project.status,
      budgetTotal: project.budget_total,
      budgetSpent: project.budget_spent,
      progressPercentage: project.progress_percentage,
      startDate: project.start_date,
      endDate: project.end_date,
      imageUrl: project.image_url,
      created_at: project.created_at,
      updated_at: project.updated_at,
      projectType: project.projectType,
      surfaceM2: project.surfaceM2,
      hasExterior: project.hasExterior,
      exteriorType: project.exteriorType,
      exteriorSurfaceM2: project.exteriorSurfaceM2
    }

    return NextResponse.json(formattedProject)
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le créateur du projet
    const existingProject = await prisma.projects.findFirst({
      where: {
        id: params.id,
        created_by: user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    await prisma.projects.delete({
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