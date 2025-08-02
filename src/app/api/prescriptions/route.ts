// src/app/api/prescriptions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
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

// POST - Créer une nouvelle prescription avec documents
export async function POST(request: NextRequest) {
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

    // Récupérer les données du formulaire
    const formData = await request.formData()
    const prescriptionDataString = formData.get('prescriptionData') as string
    const prescriptionData = JSON.parse(prescriptionDataString)
    
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
      notes,
      saveToLibrary
    } = prescriptionData

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
    const prescription = await prisma.prescriptions.create({
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
        created_by: user.id
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

    // Gérer l'upload des fichiers
    const files = formData.getAll('files') as File[]
    const uploadedDocuments = []

    if (files.length > 0) {
      // Créer le dossier d'upload s'il n'existe pas
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions', prescription.id)
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
            url: `/uploads/prescriptions/${prescription.id}/${fileName}`,
            prescriptionId: prescription.id,
            uploadedBy: user.id
          }
        })

        uploadedDocuments.push(document)
      }
    }

    // Si demandé, ajouter à la bibliothèque
    if (saveToLibrary) {
      await prisma.resource_library.create({
        data: {
          name,
          description,
          categoryId,
          brand,
          reference,
          productUrl,
          priceMin: unitPrice,
          priceMax: unitPrice,
          price: unitPrice,
          supplier,
          created_by: user.id,
          categoryPath: []
        }
      })
    }

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

    // Retourner la prescription avec les documents
    const prescriptionWithDocuments = {
      ...prescription,
      documents: uploadedDocuments
    }

    return NextResponse.json(prescriptionWithDocuments)
  } catch (error) {
    console.error('Erreur création prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la prescription' },
      { status: 500 }
    )
  }
}