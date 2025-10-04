import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { comment } = body;

    if (!comment || comment.trim() === '') {
      return NextResponse.json({ error: 'Le commentaire est requis' }, { status: 400 });
    }

    // Vérifier que la prescription existe et que le client a accès au projet
    const prescription = await prisma.prescription.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            clientAccess: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!prescription || prescription.project.clientAccess.length === 0) {
      return NextResponse.json({ error: 'Prescription non trouvée' }, { status: 404 });
    }

    // Créer le commentaire
    const newComment = await prisma.prescriptionComment.create({
      data: {
        prescriptionId: params.id,
        userId: session.user.id,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du commentaire' },
      { status: 500 }
    );
  }
}
