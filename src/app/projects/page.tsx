'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProjectGrid from '@/components/projects/ProjectGrid'
import LibraryView from '@/components/library/LibraryView'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Project {
  id: string
  name: string
  clientName: string
  status: string
  budgetTotal: number
  budgetSpent: number
  progressPercentage: number
  createdAt: string
  imageUrl?: string
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'projects' | 'library'>('projects')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProjects()
    }
  }, [session])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {activeView === 'projects' ? 'Mes Projets' : 'Bibliothèque de Ressources'}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Bienvenue, {session.user.name || session.user.email}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
              {session.user.role === 'AGENCY' ? '👩‍💼 Agence' : '👤 Client'}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Navigation tabs - Seulement pour les agences */}
        {session.user.role === 'AGENCY' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveView('projects')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'projects'
                    ? 'border-slate-800 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">🏗️</span>
                Projets ({projects.length})
              </button>
              <button
                onClick={() => setActiveView('library')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'library'
                    ? 'border-slate-800 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">📚</span>
                Bibliothèque
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'projects' ? (
          <ProjectGrid projects={projects} setProjects={setProjects} />
        ) : (
          <LibraryView projects={projects} />
        )}
      </main>
    </div>
  )
}