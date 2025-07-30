import { useState, useEffect } from 'react'
import LibraryHeader from './LibraryHeader'
import LibraryFilters from './LibraryFilters'
import ResourceGrid from './ResourceGrid'
import ResourceModal from './ResourceModal'
import AddToProjectModal from './AddToProjectModal'
import { useToast } from '@/contexts/ToastContext'

interface Project {
  id: string
  name: string
  clientName: string
}

interface LibraryViewProps {
  projects: Project[]
}

export default function LibraryView({ projects }: LibraryViewProps) {
  const { addToast } = useToast()
  const [resources, setResources] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  const [addToProjectModal, setAddToProjectModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [editingResource, setEditingResource] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchResources()
    fetchCategories()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/library/resources')
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error('Erreur chargement ressources:', error)
      addToast('Erreur lors du chargement des ressources', 'error')
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

  const toggleFavorite = async (resourceId: string, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/library/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFavorite })
      })

      if (response.ok) {
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, isFavorite: !currentFavorite } : r
        ))
        
        // Toast de succès
        addToast(
          !currentFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
          'success'
        )
      }
    } catch (error) {
      console.error('Erreur toggle favorite:', error)
      addToast('Erreur lors de la mise à jour des favoris', 'error')
    }
  }

  const handleEditResource = (resource: any) => {
    setEditingResource(resource)
    setIsEditing(true)
    setResourceModalOpen(true)
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
        
        // Toast de succès
        addToast('Ressource supprimée avec succès', 'success')
      }
    } catch (error) {
      console.error('Erreur suppression ressource:', error)
      addToast('Erreur lors de la suppression de la ressource', 'error')
    }
  }

  const filteredResources = resources.filter(resource => {
    let matchesCategory = true
    if (selectedCategory === 'ALL') {
      matchesCategory = true
    } else if (selectedCategory === 'FAVORITES') {
      matchesCategory = resource.isFavorite
    } else {
      matchesCategory = resource.category?.name === selectedCategory
    }
    
    let matchesRoom = true
    if (selectedRoom !== 'ALL') {
      matchesRoom = resource.tags?.some((tag: string) => 
        tag.toLowerCase().includes(selectedRoom.toLowerCase())
      ) || false
    }
    
    const matchesSearch = searchQuery === '' || 
      resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesRoom && matchesSearch
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => {
              setIsEditing(false)
              setEditingResource(null)
              setResourceModalOpen(true)
            }}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
          >
            + Ajouter une ressource
          </button>
        </div>
        <div className="mt-4 text-sm text-slate-600">
          {filteredResources.length} ressource{filteredResources.length > 1 ? 's' : ''} trouvée{filteredResources.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtres responsive */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Catégories - Scrollable sur mobile */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Catégories</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setSelectedCategory('FAVORITES')}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedCategory === 'FAVORITES'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⭐ Favoris ({resources.filter(r => r.isFavorite).length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pièces et mode d'affichage */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Pièce</h3>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm"
              >
                <option value="ALL">Toutes les pièces</option>
                <option value="SALON">🛋️ Salon</option>
                <option value="CUISINE">🍳 Cuisine</option>
                <option value="CHAMBRE">🛏️ Chambre</option>
                <option value="SALLE_DE_BAIN">🚿 Salle de bain</option>
                <option value="BUREAU">💻 Bureau</option>
                <option value="ENTREE">🚪 Entrée</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Vue grille"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Vue liste"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille de ressources responsive */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4">
            {selectedCategory === 'FAVORITES' ? '⭐' : '📚'}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
            Aucune ressource trouvée
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mb-6">
            {searchQuery || selectedCategory !== 'ALL' || selectedRoom !== 'ALL'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter votre première ressource'}
          </p>
          {(!searchQuery && selectedCategory === 'ALL' && selectedRoom === 'ALL') && (
            <button
              onClick={() => {
                setIsEditing(false)
                setEditingResource(null)
                setResourceModalOpen(true)
              }}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
            >
              Ajouter une ressource
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Image */}
              {resource.imageUrl && (
                <div className="aspect-w-16 aspect-h-12 bg-slate-100">
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Header avec favoris */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-slate-900 flex-1 pr-2">
                    {resource.name}
                  </h3>
                  <button
                    onClick={() => toggleFavorite(resource.id, resource.isFavorite)}
                    className="text-slate-400 hover:text-amber-500 transition-colors flex-shrink-0"
                  >
                    {resource.isFavorite ? '⭐' : '☆'}
                  </button>
                </div>

                {/* Infos */}
                {resource.brand && (
                  <p className="text-sm text-slate-600 mb-1">{resource.brand}</p>
                )}
                {resource.reference && (
                  <p className="text-xs text-slate-500 font-mono mb-2">{resource.reference}</p>
                )}
                
                {/* Prix */}
                {resource.price && (
                <p className="text-sm font-medium text-slate-900">
                  {resource.price.toFixed(2)}€ TTC
                </p>
                )}

                {/* Actions - Visible sur mobile, au hover sur desktop */}
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditResource(resource)}
                    className="flex-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setSelectedResource(resource)
                      setAddToProjectModal(true)
                    }}
                    className="flex-1 px-3 py-1.5 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    + Projet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vue liste responsive */
        <div className="space-y-3">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    {resource.imageUrl && (
                      <img 
                        src={resource.imageUrl} 
                        alt={resource.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900">{resource.name}</h3>
                        <button
                          onClick={() => toggleFavorite(resource.id, resource.isFavorite)}
                          className="text-slate-400 hover:text-amber-500 transition-colors ml-2"
                        >
                          {resource.isFavorite ? '⭐' : '☆'}
                        </button>
                      </div>
                      {resource.brand && (
                        <p className="text-sm text-slate-600">{resource.brand}</p>
                      )}
                      {resource.reference && (
                        <p className="text-xs text-slate-500 font-mono">{resource.reference}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {resource.price && (
                    <p className="text-sm font-medium text-slate-900">
                      {resource.price.toFixed(2)}€ TTC
                    </p>
                  )}
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleEditResource(resource)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResource(resource)
                        setAddToProjectModal(true)
                      }}
                      className="flex-1 sm:flex-initial px-3 py-1.5 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      + Projet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => {
          setResourceModalOpen(false)
          setIsEditing(false)
          setEditingResource(null)
        }}
        categories={categories}
        editingResource={editingResource}
        isEditing={isEditing}
        onResourceSaved={() => {
          fetchResources()
          // Toast de succès
          addToast(
            isEditing ? 'Ressource modifiée avec succès' : 'Ressource ajoutée avec succès',
            'success'
          )
        }}
      />

      <AddToProjectModal
        isOpen={addToProjectModal}
        onClose={() => {
          setAddToProjectModal(false)
          setSelectedResource(null)
        }}
        resource={selectedResource}
        projects={projects}
        onSuccess={() => {
          // Toast de succès
          addToast('Ressource ajoutée au projet', 'success')
        }}
      />
    </div>
  )
}