// app/api/library/categories-hierarchy/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer toutes les catégories parents avec leurs sous-catégories
    const parentCategories = await prisma.parentCategory.findMany({
      include: {
        subCategories: {
          include: {
            subCategories: {
              include: {
                _count: {
                  select: { resources: true }
                }
              },
              orderBy: { displayOrder: 'asc' }
            },
            _count: {
              select: { subCategories: true }
            }
          },
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { displayOrder: 'asc' }
    })

    // Compter les ressources par catégorie
    const resourceCounts = await prisma.resourceLibrary.groupBy({
      by: ['subCategory2Id'],
      _count: {
        _all: true
      }
    })

    // Créer une map pour un accès rapide aux comptes
    const countsMap = new Map(
      resourceCounts.map(item => [item.subCategory2Id, item._count._all])
    )

    // Formater les données pour le frontend
    const formattedCategories = parentCategories.map(parent => {
      const subCategoriesWithCounts = parent.subCategories.map(sub1 => {
        const subSubCategoriesWithCounts = sub1.subCategories.map(sub2 => ({
          id: sub2.id,
          name: sub2.name,
          displayOrder: sub2.displayOrder,
          resourceCount: countsMap.get(sub2.id) || 0
        }))

        const totalResourceCount = subSubCategoriesWithCounts.reduce(
          (sum, sub2) => sum + sub2.resourceCount,
          0
        )

        return {
          id: sub1.id,
          name: sub1.name,
          displayOrder: sub1.displayOrder,
          subCategories: subSubCategoriesWithCounts,
          resourceCount: totalResourceCount
        }
      })

      const totalParentResourceCount = subCategoriesWithCounts.reduce(
        (sum, sub1) => sum + sub1.resourceCount,
        0
      )

      return {
        id: parent.id,
        name: parent.name,
        displayOrder: parent.displayOrder,
        subCategories: subCategoriesWithCounts,
        resourceCount: totalParentResourceCount
      }
    })

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}