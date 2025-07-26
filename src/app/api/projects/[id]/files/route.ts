// src/app/api/projects/[id]/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET /api/projects/[id]/files - Récupérer tous les fichiers d'un projet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const category = searchParams.get('category')

    // Vérifier l'accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        creator: { id: session.user.id }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Construire les filtres
    const where: any = { projectId }
    if (spaceId) where.spaceId = spaceId
    if (category) where.category = category

    // Récupérer les fichiers
    const files = await prisma.projectFile.findMany({
      where,
      include: {
        space: {
          select: { id: true, name: true, type: true }
        },
        uploader: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Erreur récupération fichiers:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/files - Upload d'un nouveau fichier
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const projectId = params.id
    
    // Vérifier l'accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        creator: { id: session.user.id }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const spaceId = formData.get('spaceId') as string | null
    const category = formData.get('category') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validation taille (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux (max 50MB)' 
      }, { status: 400 })
    }

    // Validation type MIME
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'model/gltf+json', 'model/gltf-binary', // 3D
      'video/mp4', 'video/webm'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté' 
      }, { status: 400 })
    }

    // Déterminer le type de fichier
    let fileType = 'DOCUMENT'
    if (file.type.startsWith('image/')) fileType = 'IMAGE'
    else if (file.type === 'application/pdf') fileType = 'PDF'
    else if (file.type.startsWith('model/')) fileType = 'MODEL_3D'
    else if (file.type.startsWith('video/')) fileType = 'VIDEO'

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const fileName = `${timestamp}-${randomStr}${extension}`

    // Créer le dossier s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId)
    await mkdir(uploadDir, { recursive: true })

    // Sauvegarder le fichier
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL publique du fichier
    const fileUrl = `/uploads/projects/${projectId}/${fileName}`

    // Enregistrer en base
    const newFile = await prisma.projectFile.create({
      data: {
        name: fileName,
        originalName: file.name,
        type: fileType as any,
        category: category as any,
        mimeType: file.type,
        size: file.size,
        url: fileUrl,
        description: description || null,
        projectId,
        spaceId: spaceId || null,
        uploadedBy: session.user.id
      },
      include: {
        space: {
          select: { id: true, name: true, type: true }
        },
        uploader: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    return NextResponse.json(newFile, { status: 201 })
  } catch (error) {
    console.error('Erreur upload fichier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}