import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    // Récupérer le fichier pour avoir l'URL
    const file = await prisma.spaceFile.findUnique({
      where: { id: params.id }
    })

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Supprimer le fichier physique
    try {
      const filePath = join(process.cwd(), 'public', file.url)
      await unlink(filePath)
    } catch (error) {
      console.error('Erreur suppression fichier physique:', error)
    }

    // Supprimer de la base de données
    await prisma.spaceFile.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}