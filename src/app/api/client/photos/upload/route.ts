// app/api/client/photos/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const type = formData.get('type') as 'INSPIRATION' | 'PROJECT'
    const description = formData.get('description') as string | null
    const width = formData.get('width') as string | null
    const height = formData.get('height') as string | null

    if (!file || !projectId || !type) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier que le client a accès au projet
    const hasAccess = await prisma.projectClient.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Projet non accessible' }, { status: 403 })
    }

    // Validation pour les photos de projet
    if (type === 'PROJECT' && (!width || !height)) {
      return NextResponse.json(
        { error: 'Les dimensions sont obligatoires pour les photos de projet' },
        { status: 400 }
      )
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer un nom de fichier unique
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Définir le chemin (adapter selon ton setup - ici exemple avec /public/uploads)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'client-photos')
    const filepath = join(uploadDir, filename)

    // Sauvegarder le fichier (crée le dossier si nécessaire)
    try {
      await writeFile(filepath, buffer)
    } catch (err) {
      // Si le dossier n'existe pas, le créer
      const { mkdir } = await import('fs/promises')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filepath, buffer)
    }

    const url = `/uploads/client-photos/${filename}`

    // Créer l'entrée en base de données
    const clientPhoto = await prisma.clientPhoto.create({
      data: {
        projectId,
        userId: user.id,
        url,
        filename: file.name,
        type,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        description: description || null
      }
    })

    // Récupérer l'architecte pour notification
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { created_by: true, name: true }
    })

    if (project) {
      await prisma.notification.create({
        data: {
          type: 'PHOTO_UPLOADED',
          senderId: user.id,
          receiverId: project.created_by,
          content: `${user.firstName || user.email} a ajouté une photo ${
            type === 'INSPIRATION' ? 'd\'inspiration' : 'de projet'
          }`,
          metadata: {
            photoId: clientPhoto.id,
            projectId,
            projectName: project.name,
            photoType: type
          }
        }
      })
    }

    return NextResponse.json({ photo: clientPhoto })
  } catch (error) {
    console.error('Erreur upload photo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la photo' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}