// src/app/api/prescriptions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH - Mettre à jour une prescription
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const prescriptionId = params.id
    const body = await request.json()

    // Vérifier que la prescription existe et appartient à l'utilisateur
    const existingPrescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        createdBy: user.id
      }
    })

    if (!existingPrescription) {
      return NextResponse.json(
        { error: 'Prescription non trouvée' },
        { status: 404 }
      )
    }

    // Calculer la différence de prix pour mettre à jour le budget
    const priceDiff = (body.totalPrice || 0) - (existingPrescription.totalPrice || 0)

    // Mettre à jour la prescription
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        name: body.name,
        description: body.description,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        totalPrice: body.totalPrice,
        status: body.status,
        spaceId: body.spaceId,
        categoryId: body.categoryId,
        brand: body.brand,
        reference: body.reference,
        supplier: body.supplier,
        productUrl: body.productUrl,
        notes: body.notes,
        // Mettre à jour les dates selon le statut
        ...(body.status === 'VALIDE' && !existingPrescription.validatedAt && {
          validatedAt: new Date()
        }),
        ...(body.status === 'COMMANDE' && !existingPrescription.orderedAt && {
          orderedAt: new Date()
        }),
        ...(body.status === 'LIVRE' && !existingPrescription.deliveredAt && {
          deliveredAt: new Date()
        })
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

    // Mettre à jour le budget du projet si nécessaire
    if (priceDiff !== 0) {
      await prisma.project.update({
        where: { id: existingPrescription.projectId },
        data: {
          budget_spent: {
            increment: priceDiff
          }
        }
      })
    }

    // Calculer et mettre à jour le pourcentage de progression
    const prescriptions = await prisma.prescription.findMany({
      where: { projectId: existingPrescription.projectId }
    })
    
    const totalPrescriptions = prescriptions.length
    const deliveredPrescriptions = prescriptions.filter(p => p.status === 'LIVRE').length
    const progressPercentage = totalPrescriptions > 0 
      ? Math.round((deliveredPrescriptions / totalPrescriptions) * 100)
      : 0

    await prisma.project.update({
      where: { id: existingPrescription.projectId },
      data: { progress_percentage: progressPercentage }
    })

    return NextResponse.json(updatedPrescription)
  } catch (error) {
    console.error('Erreur mise à jour prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la prescription' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une prescription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const prescriptionId = params.id

    // Vérifier que la prescription existe et appartient à l'utilisateur
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        createdBy: user.id
      }
    })

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer la prescription
    await prisma.prescription.delete({
      where: { id: prescriptionId }
    })

    // Mettre à jour le budget du projet
    if (prescription.totalPrice && prescription.totalPrice > 0) {
      await prisma.project.update({
        where: { id: prescription.projectId },
        data: {
          budget_spent: {
            decrement: prescription.totalPrice
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la prescription' },
      { status: 500 }
    )
  }
}