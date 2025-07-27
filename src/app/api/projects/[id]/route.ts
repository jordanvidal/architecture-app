import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/projects/[id]
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
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur a accès au projet
    if (project.creator.email !== session.user.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Formater les données pour le frontend
    const formattedProject = {
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
      updatedAt: project.updated_at,
      deliveryAddress: project.delivery_contact_name ? {
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
      billingAddresses: project.billing_addresses || []
    }

    return NextResponse.json(formattedProject)
  } catch (error) {
    console.error('Erreur GET project:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id]
export async function PATCH(
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
        creator: {
          select: { email: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    if (project.creator.email !== session.user.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const data = await request.json()

    // Préparer les données pour la mise à jour
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.clientName !== undefined) updateData.client_name = data.clientName
    if (data.clientEmail !== undefined) updateData.client_email = data.clientEmail
    if (data.address !== undefined) updateData.address = data.address
    if (data.budgetTotal !== undefined) updateData.budget_total = data.budgetTotal
    if (data.startDate !== undefined) updateData.start_date = data.startDate
    if (data.endDate !== undefined) updateData.end_date = data.endDate
    if (data.status !== undefined) updateData.status = data.status

    // Mise à jour des champs de livraison
    if (data.deliveryContactName !== undefined) updateData.delivery_contact_name = data.deliveryContactName
    if (data.deliveryCompany !== undefined) updateData.delivery_company = data.deliveryCompany
    if (data.deliveryAddress !== undefined) updateData.delivery_address = data.deliveryAddress
    if (data.deliveryCity !== undefined) updateData.delivery_city = data.deliveryCity
    if (data.deliveryZipCode !== undefined) updateData.delivery_zip_code = data.deliveryZipCode
    if (data.deliveryCountry !== undefined) updateData.delivery_country = data.deliveryCountry
    if (data.deliveryAccessCode !== undefined) updateData.delivery_access_code = data.deliveryAccessCode
    if (data.deliveryFloor !== undefined) updateData.delivery_floor = data.deliveryFloor
    if (data.deliveryDoorCode !== undefined) updateData.delivery_door_code = data.deliveryDoorCode
    if (data.deliveryInstructions !== undefined) updateData.delivery_instructions = data.deliveryInstructions

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      id: updatedProject.id,
      name: updatedProject.name,
      status: updatedProject.status
    })
  } catch (error) {
    console.error('Erreur PATCH project:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
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
        creator: {
          select: { email: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    if (project.creator.email !== session.user.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE project:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}