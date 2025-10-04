import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'CLIENT') {
    redirect('/projects');
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header minimaliste */}
      <header className="border-b border-stone-200 bg-[#fafaf9]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-xl md:text-2xl font-light tracking-tight text-stone-900">Speccio</div>
              <div className="w-px h-6 bg-stone-300"></div>
              <span className="text-xs tracking-[0.2em] uppercase text-stone-500">Client</span>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <span className="text-xs md:text-sm text-stone-600 font-light">{session.user.name}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
