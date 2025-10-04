import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function ClientProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CLIENT') {
    redirect('/login');
  }

  const projects = await prisma.project.findMany({
    where: {
      clientAccess: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      spaces: {
        include: {
          prescriptions: true,
        },
      },
      _count: {
        select: {
          prescriptions: true,
          spaces: true,
        },
      },
    },
    orderBy: {
      updated_at: 'desc',  // ← Corrigé : updated_at au lieu de updatedAt
    },
  });

  const projectsWithProgress = projects.map((project) => {
    const totalPrescriptions = project._count.prescriptions;
    const completedPrescriptions = project.spaces.reduce(
      (acc, space) =>
        acc +
        space.prescriptions.filter((p) => p.status === 'LIVRE' || p.status === 'COMMANDE')
          .length,
      0
    );
    const progress =
      totalPrescriptions > 0
        ? Math.round((completedPrescriptions / totalPrescriptions) * 100)
        : 0;

    return {
      ...project,
      progress,
    };
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Vos Projets
          </h1>
          <p className="text-lg text-gray-600">
            Suivez l'avancement de vos projets d'architecture d'intérieur en temps réel
          </p>
        </div>

        {projectsWithProgress.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun projet pour le moment
            </h3>
            <p className="text-gray-600">
              Votre architecte vous donnera accès à vos projets prochainement
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectsWithProgress.map((project) => (
              <Link
                key={project.id}
                href={`/client/${project.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-pink-600/80 to-rose-600/80" />
                    
                    <div className="absolute top-4 right-4 w-16 h-16">
                      <svg className="transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${project.progress} 100`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{project.progress}%</span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                      <h3 className="text-2xl font-bold text-white mb-1">{project.name}</h3>
                      {project.address && (
                        <p className="text-white/80 text-sm">{project.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">{project._count.spaces}</span>
                          <span className="ml-1">pièces</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">{project._count.prescriptions}</span>
                          <span className="ml-1">produits</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progression</span>
                        <span className="font-semibold">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(project.updated_at).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="text-purple-600 group-hover:text-pink-600 transition-colors flex items-center font-medium">
                        Voir
                        <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
