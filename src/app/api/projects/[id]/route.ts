// src/app/api/projects/[id]/route.ts - VERSION COMPLÈTE
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import prisma from '../../../../lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const params = await context.params

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        spaces: {
          orderBy: { name: 'asc' }
        },
        prescriptions: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Transformer pour le front avec tous les champs
    const transformedProject = {
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
      creator: project.creator,
      spaces: project.spaces,
      prescriptions: project.prescriptions,
      
      // Adresse de livraison
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
      
      // Adresses de facturation
      billingAddresses: project.billing_addresses ? JSON.parse(project.billing_addresses as string) : []
    }

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error('❌ Erreur:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 })
  }
}