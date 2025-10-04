import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import PrescriptionCard from './components/PrescriptionCard';

interface PageProps {
  params: {
    projectId: string;
  };
}

export const dynamic = 'force-dynamic';

async function getProjectData(projectId: string, userId: string) {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      spaces: {
        include: {
          prescriptions: {
            include: {
              category: true,
              approvals: {
                where: {
                  userId: userId,
                },
                select: {
                  status: true,
                  comment: true,
                },
              },
              comments: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      },
      _count: {
        select: {
          prescriptions: true,
          spaces: true,
        },
      },
    },
  });
}

export default async function ClientProjectDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CLIENT') {
    redirect('/login');
  }

  // Vérifier que le client a accès à ce projet
  const projectAccess = await prisma.projectClient.findUnique({
    where: {
      projectId_userId: {
        projectId: params.projectId,
        userId: session.user.id,
      },
    },
  });

  if (!projectAccess) {
    redirect('/client');
  }

  const project = await getProjectData(params.projectId, session.user.id);

  if (!project) {
    redirect('/client');
  }

  // Calculer la progression
  const allPrescriptions = project.spaces.flatMap((space) => space.prescriptions);
  const completedPrescriptions = allPrescriptions.filter(
    (p) => p.status === 'LIVRE' || p.status === 'COMMANDE'
  );
  const progress =
    allPrescriptions.length > 0
      ? Math.round((completedPrescriptions.length / allPrescriptions.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-16 md:py-24">
        {/* Breadcrumb */}
        <div className="mb-12">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux projets
          </Link>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-8 mb-8">
            <div className="w-2 h-2 bg-stone-900 rounded-full"></div>
            <span className="text-xs tracking-[0.3em] uppercase text-stone-500">Détails du projet</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            {project.name}
          </h1>
          
          {project.address && (
            <p className="text-lg text-stone-500 mb-8">{project.address}</p>
          )}

          {project.description && (
            <p className="text-xl text-stone-700 font-light leading-relaxed max-w-3xl">
              {project.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-stone-200">
            <div>
              <div className="text-5xl font-light mb-2">{progress}%</div>
              <div className="text-sm text-stone-500 uppercase tracking-wider">Progression</div>
            </div>
            <div>
              <div className="text-5xl font-light mb-2">{project._count.spaces}</div>
              <div className="text-sm text-stone-500 uppercase tracking-wider">Espaces</div>
            </div>
            <div>
              <div className="text-5xl font-light mb-2">{allPrescriptions.length}</div>
              <div className="text-sm text-stone-500 uppercase tracking-wider">Sélections</div>
            </div>
          </div>
        </div>

        {/* Spaces */}
        <div className="space-y-24">
          {project.spaces.length === 0 ? (
            <div className="text-center py-20 border-t border-stone-200">
              <p className="text-stone-500 text-lg">Aucun espace défini pour ce projet</p>
            </div>
          ) : (
            project.spaces.map((space, spaceIndex) => (
              <div key={space.id} className="border-t border-stone-200 pt-12">
                {/* Space Header */}
                <div className="flex items-start gap-8 mb-12">
                  <div className="text-4xl font-light text-stone-300">
                    {String(spaceIndex + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-light mb-2">{space.name}</h2>
                    {space.description && (
                      <p className="text-stone-600 font-light">{space.description}</p>
                    )}
                    <div className="mt-4 text-sm text-stone-500">
                      {space.prescriptions.length} sélection{space.prescriptions.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                {space.prescriptions.length === 0 ? (
                  <div className="pl-20 text-stone-400 italic">
                    Aucune sélection pour cet espace
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6 pl-0 md:pl-20">
                    {space.prescriptions.map((prescription) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        onUpdate={() => {
                          // Force revalidation
                          window.location.reload();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
