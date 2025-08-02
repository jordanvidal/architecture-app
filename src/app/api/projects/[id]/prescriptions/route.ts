// src/app/api/projects/[id]/prescriptions/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

// Créer une instance globale pour éviter trop de connexions
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { 
        projectId: params.id 
      },
      include: {
        space: true,
        category: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Erreur API prescriptions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}