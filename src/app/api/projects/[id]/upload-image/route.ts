'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

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
      setProjects(data)
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!selectedProjectId) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`/api/projects/${selectedProjectId}/upload-image`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour la liste des projets
        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? { ...p, imageUrl: data.imageUrl }
            : p
        ))
        setUploadModalOpen(false)
        setSelectedProjectId(null)
      }
    } catch (error) {
      console.error('Erreur upload:', error)
    } finally {
      setUploading(false)
    }
  }

  // Status badge supprimé - on se concentre sur la prescription

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
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
          // Vue Projets
          projects.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Aucun projet pour le moment
              </h2>
              <p className="text-slate-600">
                Commencez par créer votre premier projet d'architecture d'intérieur.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Image du projet */}
                  <div className="relative h-48 bg-slate-100">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <div className="text-center">
                          <span className="text-4xl mb-2 block">🏠</span>
                          <p className="text-sm">Aucune image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay au survol */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedProjectId(project.id)
                          setUploadModalOpen(true)
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-white text-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:bg-slate-50"
                      >
                        {project.imageUrl ? '📷 Changer' : '📷 Ajouter'}
                      </button>
                    </div>
                  </div>

                  {/* Contenu de la carte */}
                  <a href={`/projects/${project.id}`} className="block p-6">
                    {/* Informations projet épurées */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {project.name}
                      </h3>
                      <p className="text-slate-600 text-sm">{project.clientName}</p>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Avancement</span>
                        <span>{project.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-slate-800 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-slate-600">Budget: </span>
                        <span className="font-medium text-slate-900">
                          {project.budgetTotal?.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="text-slate-500">
                        {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )
        ) : (
          // Vue Bibliothèque
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Ressources disponibles</h2>
                <p className="text-slate-600 text-sm mt-1">
                  Gérez votre bibliothèque de produits et matériaux
                </p>
              </div>
              <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                + Ajouter ressource
              </button>
            </div>

            {/* Filtres par catégorie */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-900 mb-4">Filtrer par catégorie</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Tous', icon: '📚', count: 0 },
                  { name: 'Mobilier', icon: '🛋️', count: 0 },
                  { name: 'Éclairage', icon: '💡', count: 0 },
                  { name: 'Décoration', icon: '🖼️', count: 0 },
                  { name: 'Textile', icon: '🏺', count: 0 },
                  { name: 'Revêtement', icon: '🧱', count: 0 }
                ].map((category) => (
                  <button
                    key={category.name}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de contenu bibliothèque */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Bibliothèque en construction
              </h3>
              <p className="text-slate-600 mb-4">
                Bientôt : gérez votre collection de produits, matériaux et fournisseurs préférés !
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <h4 className="font-medium text-slate-900 mb-2">Fonctionnalités prévues :</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Catalogue de produits par catégorie</li>
                  <li>• Prix et disponibilités</li>
                  <li>• Liens vers fournisseurs</li>
                  <li>• Import/export vers prescriptions</li>
                  <li>• Recherche avancée</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal d'upload d'image */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Ajouter une image au projet
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Upload en cours...</p>
              </div>
            ) : (
              <div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-slate-600 mb-2">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG jusqu'à 5MB
                    </p>
                  </label>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}