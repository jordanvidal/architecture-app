import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: session.user.id },
      include: {
        resource: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            category: true,
            subCategory2: {
              include: {
                subCategory1: {
                  include: {
                    parent: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { resourceId, status, notes } = body;

    // Vérifier que la ressource existe
    const resource = await prisma.resourceLibrary.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Ressource non trouvée' },
        { status: 404 }
      );
    }

    // Créer ou mettre à jour le favori
    const favorite = await prisma.userFavorite.upsert({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId
        }
      },
      update: {
        status,
        notes
      },
      create: {
        userId: session.user.id,
        resourceId,
        status,
        notes
      },
      include: {
        resource: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            category: true
          }
        }
      }
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du favori:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du favori' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json(
        { error: 'ID de ressource manquant' },
        { status: 400 }
      );
    }

    await prisma.userFavorite.delete({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du favori' },
      { status: 500 }
    );
  }
}