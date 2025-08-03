// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Créer une instance globale pour éviter trop de connexions
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/projects/[id] - ID reçu:', params.id)
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.email)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    console.log('User trouvé:', user?.id)

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer le projet complet avec les relations
    const project = await prisma.project.findFirst({
      where: { 
        id: params.id,
        created_by: user.id
      },
      include: {
        spaces: true,
        prescriptions: {
          include: {
            category: true,
            space: true
            // Retirer creator car ce champ n'existe pas sur Prescription
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
      // Essayons sans la condition created_by pour voir si le projet existe
      const anyProject = await prisma.project.findUnique({
        where: { id: params.id }
      })
      
      if (anyProject) {
        console.log('Projet existe mais appartient à:', anyProject.created_by, 'au lieu de:', user.id)
        return NextResponse.json({ error: 'Accès non autorisé à ce projet' }, { status: 403 })
      } else {
        console.log('Projet introuvable avec ID:', params.id)
        return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
      }
    }

    // Pour chaque prescription, ajouter les infos du créateur manuellement
    const prescriptionsWithCreator = await Promise.all(
      project.prescriptions.map(async (prescription) => {
        const creator = await prisma.user.findUnique({
          where: { id: prescription.createdBy },
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        })
        return { ...prescription, creator }
      })
    )

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      clientName: project.client_name,
      clientEmail: project.clientEmails?.[0] || project.client_email || '',
      clientEmails: project.clientEmails || [],
      address: project.address || '',
      status: project.status,
      budgetTotal: project.budget_total || 0,
      budgetSpent: project.budget_spent || 0,
      progressPercentage: project.progress_percentage || 0,
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
        contactName: project.delivery_contact_name || project.client_name,
        company: project.delivery_company,
        address: project.delivery_address,
        city: project.delivery_city,
        zipCode: project.delivery_zip_code,
        country: project.delivery_country || 'France',
        accessCode: project.delivery_access_code,
        floor: project.delivery_floor,
        doorCode: project.delivery_door_code,
        instructions: project.delivery_instructions
      } : null,
      billingAddresses: project.billing_addresses || [],
      spaces: project.spaces || [],
      prescriptions: prescriptionsWithCreator || [],
      files: project.files || [],
      creator: project.creator,
      _count: {
        prescriptions: prescriptionsWithCreator?.length || 0,
        spaces: project.spaces?.length || 0,
        files: project.files?.length || 0
      }
    }

    console.log('Projet formatté envoyé:', formattedProject.id, formattedProject.name)
    return NextResponse.json(formattedProject)
    
  } catch (error) {
    console.error('Erreur détaillée récupération projet:', error)
    
    // Retourner plus de détails sur l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération du projet',
          details: error instanceof Error ? error.message : 'Erreur inconnue',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      )
    }
    
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
    const existingProject = await prisma.project.findFirst({
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

    const project = await prisma.project.update({
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
      }
    })

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      clientName: project.client_name,
      clientEmail: project.clientEmails?.[0] || project.client_email || '',
      clientEmails: project.clientEmails || [],
      address: project.address || '',
      status: project.status,
      budgetTotal: project.budget_total || 0,
      budgetSpent: project.budget_spent || 0,
      progressPercentage: project.progress_percentage || 0,
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
    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        created_by: user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
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