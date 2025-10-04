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

    // Créer ou mettre à jour l'approbation
    const approval = await prisma.prescriptionApproval.upsert({
      where: {
        prescriptionId_userId: {
          prescriptionId: params.id,
          userId: session.user.id,
        },
      },
      update: {
        status: 'APPROVED',
      },
      create: {
        prescriptionId: params.id,
        userId: session.user.id,
        status: 'APPROVED',
      },
    });

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'approbation' },
      { status: 500 }
    );
  }
}
