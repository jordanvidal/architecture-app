import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrisma } from '@/lib/get-prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const spaceId = formData.get('spaceId') as string
    const fileType = formData.get('fileType') as string
    const description = formData.get('description') as string

    if (!file || !spaceId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Créer un nom de fichier unique
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `${Date.now()}-${file.name}`
    const publicPath = join(process.cwd(), 'public', 'uploads', 'spaces')
    const filePath = join(publicPath, fileName)
    
    // Sauvegarder le fichier
    await writeFile(filePath, buffer)
    
    // Créer l'entrée en base de données
    const spaceFile = await prisma.spacesFile.create({
      data: {
        filename: file.name,
        url: `/uploads/spaces/${fileName}`,
        fileType,
        size: file.size,
        mimeType: file.type,
        description: description || undefined,
        spaceId,
        uploadedBy: session.user.id
      },
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(spaceFile)
  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })
  }
}