// src/app/api/library/resources/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import prisma from '../../../../../lib/prisma'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const params = await context.params
    const { isFavorite } = await request.json()

    const resource = await prisma.resourceLibrary.update({
      where: { id: params.id },
      data: { isFavorite },
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

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Erreur PATCH favorite:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const params = await context.params
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

    const resource = await prisma.resourceLibrary.update({
      where: { id: params.id },
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
        tags
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

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Erreur PUT resource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const params = await context.params

    await prisma.resourceLibrary.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Ressource supprimée' })
  } catch (error) {
    console.error('Erreur DELETE resource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}