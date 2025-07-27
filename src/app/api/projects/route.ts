import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/projects
export async function GET(request: NextRequest) {
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

    const projects = await prisma.project.findMany({
      where: { created_by: user.id },
      orderBy: { updated_at: 'desc' }
    })

    // Transformer les données pour le frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.client_name,
      clientEmail: project.client_email,
      address: project.address,
      status: project.status,
      budgetTotal: project.budget_total,
      budgetSpent: project.budget_spent,
      progressPercentage: project.progress_percentage,
      startDate: project.start_date,
      endDate: project.end_date,
      imageUrl: project.image_url,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error('Erreur GET projects:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/projects
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

    const data = await request.json()

    // Préparer les données pour la création
    const projectData: any = {
      name: data.name,
      description: data.description || null,
      client_name: data.clientName,
      client_email: data.clientEmail || null,
      address: data.address || null,
      budget_total: data.budgetTotal || null,
      budget_spent: 0,
      progress_percentage: 0,
      start_date: data.startDate || new Date(),
      end_date: data.endDate || null,
      created_by: user.id,
      status: 'EN_COURS'
    }

    // Ajouter les champs de livraison s'ils sont fournis
    if (data.deliveryContactName) {
      projectData.delivery_contact_name = data.deliveryContactName
      projectData.delivery_company = data.deliveryCompany || null
      projectData.delivery_address = data.deliveryAddress || null
      projectData.delivery_city = data.deliveryCity || null
      projectData.delivery_zip_code = data.deliveryZipCode || null
      projectData.delivery_country = data.deliveryCountry || null
      projectData.delivery_access_code = data.deliveryAccessCode || null
      projectData.delivery_floor = data.deliveryFloor || null
      projectData.delivery_door_code = data.deliveryDoorCode || null
      projectData.delivery_instructions = data.deliveryInstructions || null
    }

    const project = await prisma.project.create({
      data: projectData
    })

    return NextResponse.json({
      id: project.id,
      name: project.name,
      status: project.status
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST project:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    )
  }
}