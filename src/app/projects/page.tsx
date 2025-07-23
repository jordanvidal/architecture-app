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
  const [resources, setResources] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    reference: '',
    productUrl: '',
    priceMin: '',
    priceMax: '',
    supplier: '',
    availability: '',
    tags: ''
  })
  const [addToProjectModal, setAddToProjectModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [projectSpaces, setProjectSpaces] = useState<any[]>([])
  const [targetProjectId, setTargetProjectId] = useState<string>('')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('')
  const [prescriptionData, setPrescriptionData] = useState({
    quantity: 1,
    notes: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProjects()
      fetchCategories()
      if (activeView === 'library') {
        fetchResources()
      }
    }
  }, [session, activeView])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      console.log('🔍 Projets reçus:', data)
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

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/library/resources')
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error('Erreur chargement ressources:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
    }
  }

  const handleAddResource = async () => {
    try {
      const response = await fetch('/api/library/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newResource,
          tags: newResource.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      })

      if (response.ok) {
        const resource = await response.json()
        setResources(prev => [resource, ...prev])
        setResourceModalOpen(false)
        setNewResource({
          name: '', description: '', categoryId: '', brand: '', reference: '',
          productUrl: '', priceMin: '', priceMax: '', supplier: '', availability: '', tags: ''
        })
      }
    } catch (error) {
      console.error('Erreur ajout ressource:', error)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      return
    }

    try {
      const response = await fetch(`/api/library/resources/${resourceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setResources(prev => prev.filter(r => r.id !== resourceId))
      }
    } catch (error) {
      console.error('Erreur suppression ressource:', error)
    }
  }

  const fetchProjectSpaces = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/spaces`)
      if (response.ok) {
        const spaces = await response.json()
        setProjectSpaces(spaces)
      }
    } catch (error) {
      console.error('Erreur chargement espaces:', error)
    }
  }

  const handleCreatePrescription = async () => {
    if (!targetProjectId || !selectedSpaceId || !selectedResource) return

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: targetProjectId,
          spaceId: selectedSpaceId,
          categoryId: selectedResource.categoryId,
          name: selectedResource.name,
          description: selectedResource.description,
          brand: selectedResource.brand,
          reference: selectedResource.reference,
          productUrl: selectedResource.productUrl,
          quantity: prescriptionData.quantity,
          unitPrice: selectedResource.priceMin || selectedResource.priceMax,
          totalPrice: (selectedResource.priceMin || selectedResource.priceMax || 0) * prescriptionData.quantity,
          supplier: selectedResource.supplier,
          notes: prescriptionData.notes
        })
      })

      if (response.ok) {
        alert(`✅ Prescription "${selectedResource.name}" ajoutée au projet !`)
        setAddToProjectModal(false)
        setTargetProjectId('')
        setSelectedSpaceId('')
        setPrescriptionData({ quantity: 1, notes: '' })
      }
    } catch (error) {
      console.error('Erreur création prescription:', error)
    }
  }

  const filteredResources = resources.filter(resource => {
    if (selectedCategory === 'ALL') return true
    return resource.category?.name === selectedCategory
  })

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
                  {/* Image du projet - STYLES INLINE QUI MARCHENT */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          position: 'relative',
                          zIndex: 1
                        }}
                        onError={(e) => {
                          console.log('❌ Erreur chargement image:', project.imageUrl)
                        }}
                        onLoad={() => {
                          console.log('✅ Image chargée:', project.name)
                        }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3af' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}>🏠</span>
                          <p style={{ fontSize: '0.875rem' }}>Aucune image</p>
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
          // Vue Bibliothèque - NOUVELLE INTERFACE
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Bibliothèque de ressources</h2>
                <p className="text-slate-600 text-sm mt-1">
                  Gérez votre catalogue de produits et matériaux
                </p>
              </div>
              <button 
                onClick={() => setResourceModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
              >
                + Ajouter un produit
              </button>
            </div>

            {/* Filtres par catégorie */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-medium text-slate-900 mb-4">Filtrer par catégorie</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'ALL', label: 'Tous', icon: '📚', count: resources.length },
                  { name: 'mobilier', label: 'Mobilier', icon: '🛋️', count: resources.filter(r => r.category?.name === 'mobilier').length },
                  { name: 'eclairage', label: 'Éclairage', icon: '💡', count: resources.filter(r => r.category?.name === 'eclairage').length },
                  { name: 'decoration', label: 'Décoration', icon: '🖼️', count: resources.filter(r => r.category?.name === 'decoration').length },
                  { name: 'textile', label: 'Textile', icon: '🏺', count: resources.filter(r => r.category?.name === 'textile').length },
                  { name: 'revetement', label: 'Revêtement', icon: '🧱', count: resources.filter(r => r.category?.name === 'revetement').length },
                  { name: 'peinture', label: 'Peinture', icon: '🎨', count: resources.filter(r => r.category?.name === 'peinture').length }
                ].map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.name
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des ressources */}
            {filteredResources.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {selectedCategory === 'ALL' ? 'Aucun produit' : `Aucun produit dans "${selectedCategory}"`}
                </h3>
                <p className="text-slate-600 mb-4">
                  Commencez par ajouter des produits à votre bibliothèque !
                </p>
                <button 
                  onClick={() => setResourceModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  + Ajouter le premier produit
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
                  >
                    {/* Image du produit */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                      {resource.imageUrl ? (
                        <img
                          src={resource.imageUrl}
                          alt={resource.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3af' }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '3rem', marginBottom: '0.5rem', display: 'block' }}>
                              {resource.category?.icon || '📦'}
                            </span>
                            <p style={{ fontSize: '0.875rem' }}>Aucune image</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Badge catégorie */}
                      <div className="absolute top-3 left-3">
                        <span 
                          className="px-2 py-1 text-xs font-medium text-white rounded-lg shadow-sm"
                          style={{ backgroundColor: resource.category?.colorHex || '#64748b' }}
                        >
                          {resource.category?.icon} {resource.category?.name}
                        </span>
                      </div>

                      {/* Actions au survol */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                          <button className="bg-white text-slate-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                            📝 Modifier
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteResource(resource.id)
                            }}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {resource.name}
                        </h3>
                        {resource.brand && (
                          <p className="text-sm text-slate-600 font-medium">{resource.brand}</p>
                        )}
                        {resource.description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{resource.description}</p>
                        )}
                      </div>

                      {/* Prix */}
                      {(resource.priceMin || resource.priceMax) && (
                        <div className="mb-3">
                          <span className="text-lg font-bold text-slate-900">
                            {resource.priceMin && resource.priceMax && resource.priceMin !== resource.priceMax
                              ? `${resource.priceMin} - ${resource.priceMax} €`
                              : `${resource.priceMin || resource.priceMax} €`
                            }
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedResource(resource)
                            setAddToProjectModal(true)
                          }}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                        >
                          + Ajouter au projet
                        </button>
                        {resource.productUrl && (
                          <a
                            href={resource.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            🔗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Modal d'ajout de ressource */}
      {resourceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900">
                  Ajouter un produit à la bibliothèque
                </h3>
                <button
                  onClick={() => setResourceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={newResource.name}
                    onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Canapé d'angle KIVIK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={newResource.categoryId}
                    onChange={(e) => setNewResource(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Description détaillée du produit..."
                />
              </div>

              {/* Détails produit */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={newResource.brand}
                    onChange={(e) => setNewResource(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: IKEA, BoConcept..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={newResource.reference}
                    onChange={(e) => setNewResource(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: KIVIK-ANGLE-3PL"
                  />
                </div>
              </div>

              {/* Prix */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prix minimum (€)
                  </label>
                  <input
                    type="number"
                    value={newResource.priceMin}
                    onChange={(e) => setNewResource(prev => ({ ...prev, priceMin: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="299"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prix maximum (€)
                  </label>
                  <input
                    type="number"
                    value={newResource.priceMax}
                    onChange={(e) => setNewResource(prev => ({ ...prev, priceMax: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="399"
                  />
                </div>
              </div>

              {/* Fournisseur et disponibilité */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={newResource.supplier}
                    onChange={(e) => setNewResource(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: IKEA France"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Disponibilité
                  </label>
                  <select
                    value={newResource.availability}
                    onChange={(e) => setNewResource(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="En stock">En stock</option>
                    <option value="Sur commande">Sur commande</option>
                    <option value="Selon saison">Selon saison</option>
                    <option value="Rupture">Rupture temporaire</option>
                  </select>
                </div>
              </div>

              {/* URL et tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lien produit
                </label>
                <input
                  type="url"
                  value={newResource.productUrl}
                  onChange={(e) => setNewResource(prev => ({ ...prev, productUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.ikea.com/fr/fr/p/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={newResource.tags}
                  onChange={(e) => setNewResource(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="canapé, angle, modulable, familial"
                />
              </div>
            </div>

            {/* Footer du modal */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setResourceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddResource}
                  disabled={!newResource.name || !newResource.categoryId}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Ajouter le produit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal "Ajouter au projet" - VERSION COMPLÈTE */}
      {addToProjectModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Ajouter à un projet
                </h3>
                <button
                  onClick={() => {
                    setAddToProjectModal(false)
                    setTargetProjectId('')
                    setSelectedSpaceId('')
                    setPrescriptionData({ quantity: 1, notes: '' })
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Produit sélectionné */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: selectedResource.category?.colorHex || '#64748b' }}
                  ></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{selectedResource.name}</h4>
                    <p className="text-sm text-slate-600">
                      {selectedResource.brand} • {selectedResource.category?.name}
                    </p>
                    {(selectedResource.priceMin || selectedResource.priceMax) && (
                      <p className="text-sm font-medium text-blue-700">
                        {selectedResource.priceMin && selectedResource.priceMax && selectedResource.priceMin !== selectedResource.priceMax
                          ? `${selectedResource.priceMin} - ${selectedResource.priceMax} €`
                          : `${selectedResource.priceMin || selectedResource.priceMax} €`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div className="space-y-4">
                {/* Sélection du projet */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Projet *
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => {
                      setTargetProjectId(e.target.value)
                      setSelectedSpaceId('')
                      if (e.target.value) {
                        fetchProjectSpaces(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choisir un projet</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sélection de l'espace */}
                {targetProjectId && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Espace *
                    </label>
                    <select
                      value={selectedSpaceId}
                      onChange={(e) => setSelectedSpaceId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisir un espace</option>
                      {projectSpaces.map(space => (
                        <option key={space.id} value={space.id}>
                          {space.name}
                        </option>
                      ))}
                    </select>
                    {projectSpaces.length === 0 && targetProjectId && (
                      <p className="text-sm text-amber-600 mt-1">
                        ⚠️ Aucun espace défini pour ce projet. Les espaces seront créés automatiquement.
                      </p>
                    )}
                  </div>
                )}

                {/* Quantité */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prescriptionData.quantity}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Notes spécifiques pour cette prescription..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setAddToProjectModal(false)
                    setTargetProjectId('')
                    setSelectedSpaceId('')
                    setPrescriptionData({ quantity: 1, notes: '' })
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreatePrescription}
                  disabled={!targetProjectId || !selectedResource}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Créer la prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}