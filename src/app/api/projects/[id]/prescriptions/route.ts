// src/app/api/projects/[id]/prescriptions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/projects/[id]/prescriptions - Project ID:', params.id)
    
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

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        created_by: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    // Récupérer les prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: { projectId: params.id },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Trouvé ${prescriptions.length} prescriptions pour le projet ${params.id}`)

    // Formatter les prescriptions pour le frontend
    const formattedPrescriptions = prescriptions.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      brand: p.brand,
      reference: p.reference,
      productUrl: p.productUrl,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
      supplier: p.supplier,
      status: p.status,
      notes: p.notes,
      validatedAt: null, // Ces champs n'existent pas dans le schéma
      orderedAt: null,
      deliveredAt: null,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      space: p.space ? {
        id: p.space.id,
        name: p.space.name,
        type: p.space.type
      } : null,
      category: p.category ? {
        id: p.category.id,
        name: p.category.name,
        colorHex: p.category.colorHex,
        icon: p.category.icon
      } : {
        id: 'default',
        name: 'Sans catégorie',
        colorHex: '#6B7280'
      },
      creator: p.creator
    }))

    return NextResponse.json(formattedPrescriptions)
  } catch (error) {
    console.error('Erreur détaillée récupération prescriptions:', error)
    
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          error: 'Erreur serveur',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
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

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        created_by: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès refusé' }, { status: 404 })
    }

    const body = await request.json()

    const prescription = await prisma.prescription.create({
      data: {
        name: body.name,
        description: body.description,
        brand: body.brand,
        reference: body.reference,
        productUrl: body.productUrl,
        quantity: body.quantity || 1,
        unitPrice: body.unitPrice || 0,
        totalPrice: (body.quantity || 1) * (body.unitPrice || 0),
        supplier: body.supplier,
        status: body.status || 'EN_COURS',
        notes: body.notes,
        projectId: params.id,
        spaceId: body.spaceId,
        categoryId: body.categoryId,
        createdBy: user.id
      },
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
    })

    // Formatter la prescription pour le frontend
    const formattedPrescription = {
      id: prescription.id,
      name: prescription.name,
      description: prescription.description,
      brand: prescription.brand,
      reference: prescription.reference,
      productUrl: prescription.productUrl,
      quantity: prescription.quantity,
      unitPrice: prescription.unitPrice,
      totalPrice: prescription.totalPrice,
      supplier: prescription.supplier,
      status: prescription.status,
      notes: prescription.notes,
      created_at: prescription.createdAt,
      space: prescription.space ? {
        id: prescription.space.id,
        name: prescription.space.name,
        type: prescription.space.type
      } : null,
      category: prescription.category ? {
        id: prescription.category.id,
        name: prescription.category.name,
        colorHex: prescription.category.colorHex,
        icon: prescription.category.icon
      } : {
        id: 'default',
        name: 'Sans catégorie',
        colorHex: '#6B7280'
      },
      creator: prescription.creator
    }

    return NextResponse.json(formattedPrescription)
  } catch (error) {
    console.error('Erreur création prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la prescription' },
      { status: 500 }
    )
  }
}