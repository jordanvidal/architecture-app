import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Rediriger si pas connecté
  if (!session) {
    redirect('/login');
  }

  // Rediriger si pas CLIENT
  if (session.user.role !== 'CLIENT') {
    redirect('/projects');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header simple */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-600">Speccio - Espace Client</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{session.user.name}</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      
      {/* Contenu */}
      <main>{children}</main>
    </div>
  );
}
