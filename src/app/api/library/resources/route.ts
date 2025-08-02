// src/app/api/library/resources/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Utiliser resource_library au lieu de resourceLibrary
    const resources = await prisma.resource_library.findMany({
      include: {
        prescription_categories: true,
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formater les données pour correspondre à ce que le frontend attend
    const formattedResources = resources.map(resource => ({
      ...resource,
      category: resource.prescription_categories,
      creator: resource.User
    }))

    return NextResponse.json(formattedResources)
  } catch (error) {
    console.error('Erreur GET resources:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    
    const resource = await prisma.resource_library.create({
      data: {
        ...body,
        createdBy: user.id,
        categoryPath: body.categoryPath || [],
        images: body.images || [],
        tags: body.tags || []
      },
      include: {
        prescription_categories: true,
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Formater la réponse
    const formattedResource = {
      ...resource,
      category: resource.prescription_categories,
      creator: resource.User
    }

    return NextResponse.json(formattedResource)
  } catch (error) {
    console.error('Erreur POST resource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}