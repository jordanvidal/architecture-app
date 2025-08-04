'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProjectModal from '@/components/projects/ProjectModal'
import { useToast } from '@/contexts/ToastContext'

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
  const { addToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

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

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projectName}" ?\n\nCette action est irréversible et supprimera toutes les prescriptions, espaces et fichiers associés.`)) {
      return
    }

    setDeleteLoading(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        addToast('Projet supprimé avec succès', 'success')
      } else {
        const error = await response.json()
        addToast(error.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      addToast('Erreur lors de la suppression du projet', 'error')
    } finally {
      setDeleteLoading(null)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BROUILLON': return 'bg-slate-100 text-slate-700'
      case 'EN_COURS': return 'bg-blue-100 text-blue-700'
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700'
      case 'TERMINE': return 'bg-green-100 text-green-700'
      case 'ANNULE': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'BROUILLON': return 'Brouillon'
      case 'EN_COURS': return 'En cours'
      case 'EN_ATTENTE': return 'En attente'
      case 'TERMINE': return 'Terminé'
      case 'ANNULE': return 'Annulé'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Mes Projets
          </h1>
          <p className="text-slate-600">
            Gérez vos projets d'architecture d'intérieur
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm sm:text-base"
              />
            </div>
            
            <div className="flex gap-2 sm:gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm sm:text-base"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="EN_COURS">En cours</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="TERMINE">Terminé</option>
                <option value="ANNULE">Annulé</option>
              </select>
              
              <button 
                onClick={handleNewProject}
                className="px-4 sm:px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nouveau Projet</span>
                <span className="sm:hidden">Nouveau</span>
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl sm:text-6xl mb-4"></div>
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
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                {/* Image / Thumbnail */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <Link href={`/projects/${project.id}`} className="block w-full h-full">
                    {project.imageUrl ? (
                      <img 
                        src={project.imageUrl} 
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  
                  {/* Actions en overlay */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditProject(project)
                      }}
                      className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      title="Modifier le projet"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteProject(project.id, project.name)
                      }}
                      disabled={deleteLoading === project.id}
                      className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      title="Supprimer le projet"
                    >
                      {deleteLoading === project.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <Link href={`/projects/${project.id}`} className="block p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                      {project.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-3">{project.clientName}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Budget</span>
                      <span className="font-medium">
                        {project.budgetTotal?.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Progression</span>
                      <span className="font-medium">{project.progressPercentage}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-slate-800 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progressPercentage}%` }}
                    ></div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <ProjectModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingProject(null)
            setIsEditing(false)
          }}
          project={editingProject}
          onProjectSaved={() => {
            fetchProjects()
            setModalOpen(false)
            setEditingProject(null)
            setIsEditing(false)
          }}
        />
      )}
    </div>
  )
}