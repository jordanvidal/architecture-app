'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string
  clientName: string
  status: string
  budgetTotal: number
  budgetSpent: number
  progressPercentage: number
  startDate: string
  imageUrl?: string
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status, router])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'ALL' || project.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header de la page */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Mes projets
              </h1>
              <p className="mt-1 text-slate-600">
                Gérez vos projets d'architecture d'intérieur
              </p>
            </div>
            <button 
              onClick={() => {/* TODO: Ouvrir modale création */}}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              + Nouveau projet
            </button>
          </div>
        </div>
      </header>

      {/* Filtres et recherche */}
      <div className="max-w-7xl mx-auto px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'EN_COURS', 'TERMINE', 'EN_ATTENTE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === status
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'Tous' :
                 status === 'EN_COURS' ? 'En cours' :
                 status === 'TERMINE' ? 'Terminés' :
                 'En attente'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille de projets */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery || filterStatus !== 'ALL' 
                ? 'Aucun projet trouvé' 
                : 'Aucun projet pour le moment'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || filterStatus !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Créez votre premier projet pour commencer'}
            </p>
            {(!searchQuery && filterStatus === 'ALL') && (
              <button 
                onClick={() => {/* TODO: Ouvrir modale création */}}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Créer un projet
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link 
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                    project.status === 'TERMINE' ? 'bg-green-100 text-green-800' :
                    project.status === 'EN_ATTENTE' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'EN_COURS' ? 'En cours' :
                     project.status === 'TERMINE' ? 'Terminé' :
                     project.status === 'EN_ATTENTE' ? 'En attente' :
                     project.status}
                  </span>
                </div>
                
                <p className="text-slate-600 mb-4">
                  {project.clientName}
                </p>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Avancement</span>
                    <span>{project.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-slate-800 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progressPercentage}%` }}
                    />
                  </div>
                </div>
                
                {/* Budget */}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Budget</span>
                  <span className="font-medium text-slate-900">
                    {project.budgetTotal?.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}