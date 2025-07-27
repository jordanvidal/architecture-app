'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProjectModal from '@/components/projects/ProjectModal'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditing, setIsEditing] = useState(false)

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

  const handleNewProject = () => {
    setEditingProject(null)
    setIsEditing(false)
    setModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsEditing(true)
    setModalOpen(true)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Mes projets
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-600">
                Gérez vos projets d'architecture d'intérieur
              </p>
            </div>
            <button 
              onClick={handleNewProject}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
            >
              + Nouveau projet
            </button>
          </div>
        </div>
      </header>

      {/* Filtres et recherche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex flex-col gap-4">
          {/* Barre de recherche */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          
          {/* Filtres - Scrollable sur mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
            {['ALL', 'EN_COURS', 'TERMINE', 'EN_ATTENTE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap text-sm flex-shrink-0 ${
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl sm:text-6xl mb-4">📁</div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
              {searchQuery || filterStatus !== 'ALL' 
                ? 'Aucun projet trouvé' 
                : 'Aucun projet pour le moment'}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mb-6">
              {searchQuery || filterStatus !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Créez votre premier projet pour commencer'}
            </p>
            {(!searchQuery && filterStatus === 'ALL') && (
              <button 
                onClick={handleNewProject}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
              >
                Créer un projet
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow relative group"
              >
                {/* Bouton d'édition */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleEditProject(project)
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg shadow-md hover:shadow-lg touch-manipulation"
                  title="Modifier le projet"
                >
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                <Link href={`/projects/${project.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 pr-8">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
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
                  
                  <p className="text-sm sm:text-base text-slate-600 mb-4">
                    {project.clientName}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-1">
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
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-600">Budget</span>
                    <span className="font-medium text-slate-900">
                      {project.budgetTotal?.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Project Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProject(null)
          setIsEditing(false)
        }}
        onProjectSaved={fetchProjects}
        editingProject={editingProject || undefined}
        isEditing={isEditing}
      />
    </div>
  )
}