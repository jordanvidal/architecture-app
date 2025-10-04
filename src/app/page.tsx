import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Si pas connecté, rediriger vers login
  if (!session) {
    redirect('/login');
  }

  // Redirection selon le rôle
  if (session.user.role === 'CLIENT') {
    redirect('/client');
  } else {
    redirect('/projects');
  }
}
