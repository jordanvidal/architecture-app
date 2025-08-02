// src/app/api/projects/[id]/prescriptions/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import prisma from '../../../../../lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: projectId } = await params

    const prescriptions = await prisma.prescriptions.findMany({
      where: { 
        projectId
      },
      include: {
        spaces: true,
        prescription_categories: true,
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        documents: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // Formatter pour le frontend
    const formattedPrescriptions = prescriptions.map(p => ({
      ...p,
      space: p.spaces,
      category: p.prescription_categories,
      creator: p.User
    }))

    return NextResponse.json(formattedPrescriptions)
  } catch (error) {
    console.error('Erreur API prescriptions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}