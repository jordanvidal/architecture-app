import { useState } from 'react'

interface ResourceGridProps {
  resources: any[]
  viewMode: 'grid' | 'list'
  selectedCategory: string
  selectedRoom: string
  onToggleFavorite: (id: string, current: boolean) => void
  onEditResource: (resource: any) => void
  onDeleteResource: (id: string) => void
  onAddToProject: (resource: any) => void
  onAddResource: () => void
}

export default function ResourceGrid({
  resources,
  viewMode,
  selectedCategory,
  selectedRoom,
  onToggleFavorite,
  onEditResource,
  onDeleteResource,
  onAddToProject,
  onAddResource
}: ResourceGridProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (resourceId: string) => {
    setImageErrors(prev => ({ ...prev, [resourceId]: true }))
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Aucune ressource trouvée
        </h3>
        <p className="text-slate-600 mb-6">
          {selectedCategory === 'ALL' && selectedRoom === 'ALL' 
            ? 'Commencez par ajouter des ressources à votre bibliothèque'
            : 'Aucune ressource ne correspond à vos filtres'
          }
        </p>
        <button
          onClick={onAddResource}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Ajouter une ressource
        </button>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative bg-slate-100">
              {resource.imageUrl && !imageErrors[resource.id] ? (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(resource.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span className="text-2xl">Photo</span>
                </div>
              )}
              <button
                onClick={() => onToggleFavorite(resource.id, resource.isFavorite)}
                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                  resource.isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 text-slate-600 hover:bg-white'
                }`}
              >
                  resource.isFavorite ? '♥' : '♡'
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-slate-900 mb-1">{resource.name}</h3>
              {resource.brand && (
                <p className="text-sm text-slate-600 mb-2">{resource.brand}</p>
              )}
              {resource.price && (
                <p className="text-sm font-medium text-slate-900">
                  {resource.price.toFixed(2)}€ TTC
                </p>
              )}
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onAddToProject(resource)}
                  className="flex-1 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                >
                  + Projet
                </button>
                <button
                  onClick={() => onEditResource(resource)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Modifier"
                >
                  ✎
                </button>
                <button
                  onClick={() => onDeleteResource(resource.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div key={resource.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex gap-6">
            <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
              {resource.imageUrl && !imageErrors[resource.id] ? (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(resource.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span className="text-sm">Photo</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-slate-900 text-lg">{resource.name}</h3>
                  {resource.brand && (
                    <p className="text-slate-600">{resource.brand}</p>
                  )}
                  {resource.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {resource.price && (
                    <p className="text-lg font-medium text-slate-900">
                      {resource.price.toFixed(2)}€ TTC
                    </p>
                  )}
                  <button
                    onClick={() => onToggleFavorite(resource.id, resource.isFavorite)}
                    className={`p-2 rounded-full transition-colors ${
                      resource.isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                      resource.isFavorite ? '♥' : '♡'
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onAddToProject(resource)}
                  className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Ajouter au projet
                </button>
                <button
                  onClick={() => onEditResource(resource)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDeleteResource(resource.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}