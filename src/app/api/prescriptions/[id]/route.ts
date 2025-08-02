// src/app/api/prescriptions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrisma } from '@/lib/get-prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Configuration de l'upload
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg'
]

// GET - Récupérer une prescription avec ses documents
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const prescription = await prisma.prescriptions.findUnique({
      where: { id: params.id },
      include: {
        space: true,
        category: true,
        documents: true,
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

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Erreur récupération prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la prescription' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour une prescription avec documents
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.User.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const prescriptionId = params.id

    // Vérifier que la prescription existe et appartient à l'utilisateur
    const existingPrescription = await prisma.prescriptions.findFirst({
      where: {
        id: prescriptionId,
        created_by: user.id
      },
      include: {
        documents: true
      }
    })

    if (!existingPrescription) {
      return NextResponse.json(
        { error: 'Prescription non trouvée' },
        { status: 404 }
      )
    }

    // Récupérer les données du formulaire
    const formData = await request.formData()
    const prescriptionDataString = formData.get('prescriptionData') as string
    const prescriptionData = JSON.parse(prescriptionDataString)
    const existingFileIdsString = formData.get('existingFileIds') as string
    const existingFileIds = JSON.parse(existingFileIdsString || '[]')

    // Calculer la différence de prix pour mettre à jour le budget
    const priceDiff = (prescriptionData.totalPrice || 0) - (existingPrescription.totalPrice || 0)

    // Mettre à jour la prescription
    const updatedPrescription = await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: {
        name: prescriptionData.name,
        description: prescriptionData.description,
        quantity: prescriptionData.quantity,
        unitPrice: prescriptionData.unitPrice,
        totalPrice: prescriptionData.totalPrice,
        status: prescriptionData.status,
        spaceId: prescriptionData.spaceId,
        categoryId: prescriptionData.categoryId,
        brand: prescriptionData.brand,
        reference: prescriptionData.reference,
        supplier: prescriptionData.supplier,
        productUrl: prescriptionData.productUrl,
        notes: prescriptionData.notes
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

    // Gérer les documents supprimés
    const documentsToDelete = existingPrescription.documents.filter(
      doc => !existingFileIds.includes(doc.id)
    )

    for (const doc of documentsToDelete) {
      // Supprimer le fichier physique
      try {
        const filePath = path.join(process.cwd(), 'public', doc.url)
        await unlink(filePath)
      } catch (error) {
        console.error('Erreur suppression fichier:', error)
      }

      // Supprimer de la base de données
      await prisma.prescriptionsDocument.delete({
        where: { id: doc.id }
      })
    }

    // Gérer l'upload des nouveaux fichiers
    const files = formData.getAll('files') as File[]
    const uploadedDocuments = []

    if (files.length > 0) {
      // Créer le dossier d'upload s'il n'existe pas
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions', prescriptionId)
      await mkdir(uploadDir, { recursive: true })

      for (const file of files) {
        // Vérifier le type de fichier
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          console.error(`Type de fichier non autorisé: ${file.type}`)
          continue
        }

        // Vérifier la taille du fichier
        if (file.size > MAX_FILE_SIZE) {
          console.error(`Fichier trop volumineux: ${file.name}`)
          continue
        }

        // Générer un nom unique pour le fichier
        const fileExtension = path.extname(file.name)
        const fileName = `${uuidv4()}${fileExtension}`
        const filePath = path.join(uploadDir, fileName)
        
        // Sauvegarder le fichier
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Créer l'entrée dans la base de données
        const document = await prisma.prescriptionsDocument.create({
          data: {
            name: file.name,
            originalName: file.name,
            type: 'OTHER' as any, // À adapter selon votre enum FileType
            mimeType: file.type,
            size: file.size,
            url: `/uploads/prescriptions/${prescriptionId}/${fileName}`,
            prescriptionId: prescriptionId,
            uploadedBy: user.id
          }
        })

        uploadedDocuments.push(document)
      }
    }

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

    // Récupérer tous les documents actuels
    const allDocuments = await prisma.prescriptionsDocument.findMany({
      where: { prescriptionId }
    })

    // Retourner la prescription mise à jour avec tous les documents
    const prescriptionWithDocuments = {
      ...updatedPrescription,
      documents: allDocuments
    }

    return NextResponse.json(prescriptionWithDocuments)
  } catch (error) {
    console.error('Erreur mise à jour prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la prescription' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une prescription et ses documents
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.User.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const prescriptionId = params.id

    // Vérifier que la prescription existe et appartient à l'utilisateur
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: prescriptionId,
        created_by: user.id
      },
      include: {
        documents: true
      }
    })

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer tous les fichiers physiques
    for (const doc of prescription.documents) {
      try {
        const filePath = path.join(process.cwd(), 'public', doc.url)
        await unlink(filePath)
      } catch (error) {
        console.error('Erreur suppression fichier:', error)
      }
    }

    // Supprimer le dossier de la prescription s'il est vide
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions', prescriptionId)
      await unlink(uploadDir)
    } catch (error) {
      // Le dossier n'est peut-être pas vide ou n'existe pas
    }

    // Supprimer la prescription (les documents seront supprimés en cascade)
    await prisma.prescriptions.delete({
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