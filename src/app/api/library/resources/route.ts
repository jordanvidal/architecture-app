import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const resources = await prisma.resourceLibrary.findMany({
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
        user_favorites: {
          where: {
            user_id: session.user.id
          },
          select: {
            status: true,
            notes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedResources = resources.map(resource => ({
      ...resource,
      isFavorite: resource.user_favorites.length > 0,
      addedBy: {
        id: resource.creator.id,
        name: `${resource.creator.firstName || ''} ${resource.creator.lastName || ''}`.trim() || resource.creator.email,
        email: resource.creator.email
      },
      userFavorites: resource.user_favorites
    }));

    return NextResponse.json(transformedResources);
  } catch (error) {
    console.error('Erreur lors de la récupération des ressources:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ressources' },
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
    
    const resource = await prisma.resourceLibrary.create({
      data: {
        name: body.name,
        description: body.description,
        brand: body.brand,
        reference: body.reference,
        imageUrl: body.imageUrl || body.mainImageUrl,
        mainImageUrl: body.mainImageUrl || body.imageUrl,
        images: body.images || [],
        productUrl: body.productUrl,
        type: body.type,
        categoryId: body.categoryId,
        price: body.price ? parseFloat(body.price) : null,
        pricePro: body.pricePro ? parseFloat(body.pricePro) : null,
        supplier: body.supplier,
        tags: body.tags || [],
        categoryPath: body.categoryPath || [],
        createdBy: session.user.id,
        isFavorite: body.isFavorite || false,
      },
      include: {
        creator: true,
        category: true,
      }
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Erreur création ressource:', error);
    return NextResponse.json({ error: 'Erreur création' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    const resource = await prisma.resourceLibrary.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        brand: body.brand,
        reference: body.reference,
        imageUrl: body.imageUrl || body.mainImageUrl,
        mainImageUrl: body.mainImageUrl,
        images: body.images || [],
        productUrl: body.productUrl,
        type: body.type,
        categoryId: body.categoryId,
        price: body.price ? parseFloat(body.price) : null,
        pricePro: body.pricePro ? parseFloat(body.pricePro) : null,
        supplier: body.supplier,
      },
      include: {
        creator: true,
        category: true,
      }
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Erreur update ressource:', error);
    return NextResponse.json({ error: 'Erreur update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.resourceLibrary.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression:', error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
