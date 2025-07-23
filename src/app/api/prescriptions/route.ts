// src/app/api/prescriptions/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      spaceId,
      categoryId,
      name,
      description,
      brand,
      reference,
      productUrl,
      quantity = 1,
      unitPrice,
      totalPrice,
      supplier,
      notes
    } = body

    if (!projectId || !spaceId || !categoryId || !name) {
      return NextResponse.json({ 
        error: 'Projet, espace, catégorie et nom requis' 
      }, { status: 400 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        projectId,
        spaceId,
        categoryId,
        name,
        description,
        brand,
        reference,
        productUrl,
        quantity: parseInt(quantity),
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        supplier,
        notes,
        status: 'EN_COURS',
        createdBy: session.user.id
      },
      include: {
        space: true,
        category: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Erreur POST prescription:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}