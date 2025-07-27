// src/app/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  // Vérifier si l'utilisateur est connecté
  const session = await getServerSession(authOptions)
  
  if (session) {
    // Si connecté, rediriger vers les projets
    redirect('/projects')
  } else {
    // Si non connecté, rediriger vers la page de login
    redirect('/login')
  }
}