// src/app/api/prescriptions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST - Créer une nouvelle prescription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      quantity,
      unitPrice,
      totalPrice,
      status,
      projectId,
      spaceId,
      categoryId,
      brand,
      reference,
      supplier,
      productUrl,
      notes
    } = body

    // Validation
    if (!name || !projectId || !categoryId) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que le projet appartient bien à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        created_by: user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Créer la prescription
    const prescription = await prisma.prescription.create({
      data: {
        name,
        description,
        quantity: quantity || 1,
        unitPrice: unitPrice || 0,
        totalPrice: totalPrice || 0,
        status: status || 'EN_COURS',
        projectId,
        spaceId,
        categoryId,
        brand,
        reference,
        supplier,
        productUrl,
        notes,
        createdBy: user.id
      },
      include: {
        space: true,
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Mettre à jour le budget dépensé du projet
    if (totalPrice > 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          budget_spent: {
            increment: totalPrice
          }
        }
      })
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Erreur création prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la prescription' },
      { status: 500 }
    )
  }
}