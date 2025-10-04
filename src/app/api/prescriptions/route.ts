import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Gérer FormData (multipart)
    const formData = await request.formData();
    const prescriptionDataStr = formData.get('prescriptionData') as string;
    
    if (!prescriptionDataStr) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const body = JSON.parse(prescriptionDataStr);
    const { projectId, spaceId, categoryId, name, description, brand, reference, supplier, unitPrice, quantity, productUrl, notes } = body;

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Les champs projectId et name sont requis' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'La catégorie est requise' },
        { status: 400 }
      );
    }

    // Validation et nettoyage des champs numériques
    const cleanUnitPrice = unitPrice && unitPrice !== '' && unitPrice !== '-' ? parseFloat(unitPrice) : null;
    const cleanQuantity = quantity && quantity !== '' && quantity !== '-' ? parseInt(quantity) : 1;
    const cleanTotalPrice = cleanUnitPrice && cleanQuantity ? cleanUnitPrice * cleanQuantity : null;

    const prescription = await prisma.prescription.create({
      data: {
        projectId,
        spaceId: spaceId || null,
        categoryId,
        name,
        description: description || null,
        brand: brand || null,
        reference: reference || null,
        supplier: supplier || null,
        unitPrice: cleanUnitPrice,
        quantity: cleanQuantity,
        totalPrice: cleanTotalPrice,
        productUrl: productUrl || null,
        notes: notes || null,
        status: 'EN_COURS',
        createdBy: user.id,
      },
      include: {
        category: true,
        space: true,
      },
    });

    // TODO: Gérer l'upload des fichiers si besoin
    // const files = formData.getAll('files');

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la prescription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la prescription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
