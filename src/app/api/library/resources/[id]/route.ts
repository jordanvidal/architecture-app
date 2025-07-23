// src/app/api/library/resources/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await prisma.resourceLibrary.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Ressource supprimée' })
  } catch (error) {
    console.error('Erreur DELETE resource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}