// src/app/api/library/resources/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import prisma from '../../../../lib/prisma'

// GET - Récupérer toutes les ressources
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const resources = await prisma.resourceLibrary.findMany({
      include: {
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
        { isFavorite: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Erreur GET resources:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle ressource
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      brand,
      reference,
      productUrl,
      priceMin,
      priceMax,
      supplier,
      availability,
      imageUrl,
      tags = []
    } = body

    if (!name || !categoryId) {
      return NextResponse.json({ 
        error: 'Nom et catégorie requis' 
      }, { status: 400 })
    }

    const resource = await prisma.resourceLibrary.create({
      data: {
        name,
        description,
        categoryId,
        brand,
        reference,
        productUrl,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        supplier,
        availability,
        imageUrl,
        tags,
        createdBy: session.user.id
      },
      include: {
        category: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Erreur POST resource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}