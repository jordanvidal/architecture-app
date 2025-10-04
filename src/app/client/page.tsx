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
      updated_at: 'desc',
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
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-16 md:py-24">
        {/* Header */}
        <div className="mb-20 md:mb-32">
          <div className="flex items-center gap-8 mb-12">
            <div className="w-2 h-2 bg-stone-900 rounded-full"></div>
            <span className="text-xs tracking-[0.3em] uppercase text-stone-500">Speccio Client</span>
          </div>
          <h1 className="text-6xl md:text-[8rem] leading-[0.9] font-light tracking-tight mb-8">
            Vos<br/>Projets
          </h1>
          <p className="text-lg md:text-xl text-stone-600 font-light max-w-xl">
            Suivez l'évolution de vos projets d'architecture d'intérieur avec clarté et précision.
          </p>
        </div>

        {/* Projects */}
        {projectsWithProgress.length === 0 ? (
          <div className="text-center py-32 border-t border-stone-200">
            <div className="text-8xl font-light text-stone-200 mb-8">∅</div>
            <h3 className="text-3xl font-light text-stone-700 mb-4">
              Aucun projet pour le moment
            </h3>
            <p className="text-stone-500">
              Votre architecte vous donnera accès à vos projets prochainement
            </p>
          </div>
        ) : (
          <div className="space-y-20 md:space-y-32">
            {projectsWithProgress.map((project, index) => (
              <Link
                key={project.id}
                href={`/client/${project.id}`}
                className="group cursor-pointer block"
              >
                <div className="grid grid-cols-12 gap-4 md:gap-8 items-start">
                  {/* Number */}
                  <div className="col-span-3 md:col-span-2">
                    <div className="text-5xl md:text-8xl font-light text-stone-300 group-hover:text-stone-900 transition-colors duration-500">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="col-span-9 md:col-span-10">
                    <div className="border-t border-stone-300 pt-6 md:pt-8">
                      <h2 className="text-3xl md:text-5xl font-light mb-6 group-hover:translate-x-4 transition-transform duration-500">
                        {project.name}
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-8 md:mb-12">
                        <div>
                          <p className="text-stone-500 mb-4 tracking-wide text-sm md:text-base">{project.address}</p>
                          {project.description && (
                            <p className="text-stone-700 leading-relaxed font-light text-sm md:text-base">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="space-y-4 md:space-y-6">
                          <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
                            <span className="text-xs md:text-sm text-stone-500 uppercase tracking-wider">Progression</span>
                            <span className="text-2xl md:text-3xl font-light">{project.progress}%</span>
                          </div>
                          <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
                            <span className="text-xs md:text-sm text-stone-500 uppercase tracking-wider">Espaces</span>
                            <span className="text-2xl md:text-3xl font-light">{project._count.spaces}</span>
                          </div>
                          <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
                            <span className="text-xs md:text-sm text-stone-500 uppercase tracking-wider">Sélections</span>
                            <span className="text-2xl md:text-3xl font-light">{project._count.prescriptions}</span>
                          </div>
                          <div className="pt-4">
                            <span className="text-xs text-stone-400 uppercase tracking-widest">
                              {new Date(project.updated_at).toLocaleDateString('fr-FR', { 
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-stone-900 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
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
