interface ResourceGridProps {
  resources: any[]
  viewMode: 'grid' | 'list'
  selectedCategory: string
  selectedRoom: string
  onToggleFavorite: (resourceId: string, currentFavorite: boolean) => void
  onEditResource: (resource: any) => void
  onDeleteResource: (resourceId: string) => void
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
  if (resources.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">
            {selectedRoom !== 'ALL' ? '🏠' : selectedCategory === 'FAVORITES' ? '⭐' : '📦'}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {selectedRoom !== 'ALL' ? `Aucun produit pour "${selectedRoom}"` :
           selectedCategory === 'ALL' ? 'Aucun produit' : 
           selectedCategory === 'FAVORITES' ? 'Aucun favori' :
           `Aucun produit dans "${selectedCategory}"`}
        </h3>
        <p className="text-slate-600 mb-4">
          {selectedCategory === 'FAVORITES' ? 
            'Ajoutez des produits en favoris en cliquant sur l\'étoile !' :
            selectedRoom !== 'ALL' ?
            'Essayez d\'ajouter des tags de pièce à vos produits !' :
            'Commencez par ajouter des produits à votre bibliothèque !'}
        </p>
        {selectedCategory === 'ALL' && selectedRoom === 'ALL' && (
          <button 
            onClick={onAddResource}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            + Ajouter le premier produit
          </button>
        )}
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="p-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                  {resource.imageUrl ? (
                    <img
                      src={resource.imageUrl}
                      alt={resource.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-2xl">
                        {resource.category?.icon || '📦'}
                      </span>
                    </div>
                  )}
                  
                  {/* Étoile favorite sur thumbnail */}
                  <div className="absolute top-1 right-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onToggleFavorite(resource.id, resource.isFavorite)
                      }}
                      className={`w-6 h-6 rounded-full shadow-sm transition-all duration-200 flex items-center justify-center ${
                        resource.isFavorite 
                          ? 'bg-yellow-400 text-white' 
                          : 'bg-white text-yellow-500'
                      }`}
                    >
                      <span className="text-xs">
                        {resource.isFavorite ? '⭐' : '☆'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Informations */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {resource.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {resource.brand && (
                          <span className="text-sm font-medium text-slate-600">
                            {resource.brand}
                          </span>
                        )}
                        <span 
                          className="px-2 py-1 text-xs font-medium text-white rounded"
                          style={{ backgroundColor: resource.category?.colorHex || '#64748b' }}
                        >
                          {resource.category?.icon} {resource.category?.name}
                        </span>
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex gap-1">
                            {resource.tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                                {tag}
                              </span>
                            ))}
                            {resource.tags.length > 2 && (
                              <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                                +{resource.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Prix */}
                    {(resource.priceMin || resource.priceMax) && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">
                          {resource.priceMin && resource.priceMax && resource.priceMin !== resource.priceMax
                            ? `${resource.priceMin} - ${resource.priceMax} €`
                            : `${resource.priceMin || resource.priceMax} €`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {resource.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  {/* Actions en ligne */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onAddToProject(resource)}
                        className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        + Projet
                      </button>
                      <button 
                        onClick={() => onEditResource(resource)}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        ✏️ Modifier
                      </button>
                      {resource.productUrl && (
                        <a
                          href={resource.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                          🔗 Lien
                        </a>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => onDeleteResource(resource.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Vue grille
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
        >
          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
            {resource.imageUrl ? (
              <img
                src={resource.imageUrl}
                alt={resource.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">
                    {resource.category?.icon || '📦'}
                  </span>
                  <p className="text-sm">Aucune image</p>
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

            {/* Étoile favorite */}
            <div className="absolute top-2 right-2" style={{ zIndex: 999 }}>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleFavorite(resource.id, resource.isFavorite)
                }}
                className={`w-8 h-8 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110 ${
                  resource.isFavorite 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500' 
                    : 'bg-white bg-opacity-90 hover:bg-opacity-100 hover:bg-yellow-50'
                }`}
              >
                <span className={`text-lg transition-all duration-200 ${
                  resource.isFavorite ? 'text-white' : 'text-yellow-500'
                }`}>
                  {resource.isFavorite ? '⭐' : '☆'}
                </span>
              </button>
            </div>

            {/* Actions au survol */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditResource(resource)
                  }}
                  className="bg-white text-slate-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  📝 Modifier
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteResource(resource.id)
                  }}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>

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
                onClick={() => onAddToProject(resource)}
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
  )
}