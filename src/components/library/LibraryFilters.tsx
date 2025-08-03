import { useState } from 'react'

interface SubCategory2 {
  id: string
  name: string
  displayOrder: number
  resourceCount: number
}

interface SubCategory1 {
  id: string
  name: string
  displayOrder: number
  subCategories: SubCategory2[]
  resourceCount: number
}

interface ParentCategory {
  id: string
  name: string
  displayOrder: number
  subCategories: SubCategory1[]
  resourceCount: number
}

interface LibraryFiltersProps {
  resources: any[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRoom: string
  setSelectedRoom: (room: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  hierarchicalCategories: ParentCategory[]
}

export default function LibraryFilters({
  resources,
  selectedCategory,
  setSelectedCategory,
  selectedRoom,
  setSelectedRoom,
  viewMode,
  setViewMode,
  hierarchicalCategories
}: LibraryFiltersProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSubCategory = (subCategoryId: string) => {
    const newExpanded = new Set(expandedSubCategories)
    if (newExpanded.has(subCategoryId)) {
      newExpanded.delete(subCategoryId)
    } else {
      newExpanded.add(subCategoryId)
    }
    setExpandedSubCategories(newExpanded)
  }

  const handleCategorySelect = (categoryId: string, categoryType: 'parent' | 'sub1' | 'sub2') => {
    setSelectedCategory(`${categoryType}:${categoryId}`)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Sélecteur de vue */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-slate-900">Affichage et filtres</h3>
        <div className="flex rounded-lg border border-slate-200 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span className="mr-1">⊞</span> Grille
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span className="mr-1">☰</span> Liste
          </button>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div>
        <h4 className="font-medium text-slate-900 mb-3">Par catégorie</h4>
        
        {/* Boutons globaux */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'ALL'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="mr-1">📚</span>
            Tous ({resources.length})
          </button>
          <button
            onClick={() => setSelectedCategory('FAVORITES')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'FAVORITES'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="mr-1">⭐</span>
            Favoris ({resources.filter(r => r.isFavorite).length})
          </button>
        </div>

        {/* Catégories hiérarchiques */}
        <div className="space-y-2">
          {hierarchicalCategories.map((parentCat) => (
            <div key={parentCat.id} className="border rounded-lg overflow-hidden">
              {/* Catégorie parent */}
              <div className="flex items-center">
                <button
                  onClick={() => toggleCategory(parentCat.id)}
                  className="p-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-500">
                    {expandedCategories.has(parentCat.id) ? '▼' : '▶'}
                  </span>
                </button>
                <button
                  onClick={() => handleCategorySelect(parentCat.id, 'parent')}
                  className={`flex-1 px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selectedCategory === `parent:${parentCat.id}`
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {parentCat.name} ({parentCat.resourceCount})
                </button>
              </div>

              {/* Sous-catégories niveau 1 */}
              {expandedCategories.has(parentCat.id) && (
                <div className="ml-4 border-l-2 border-slate-200">
                  {parentCat.subCategories.map((sub1) => (
                    <div key={sub1.id}>
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleSubCategory(sub1.id)}
                          className="p-2 hover:bg-slate-50 transition-colors"
                          disabled={sub1.subCategories.length === 0}
                        >
                          <span className="text-slate-400">
                            {sub1.subCategories.length > 0 
                              ? (expandedSubCategories.has(sub1.id) ? '▼' : '▶')
                              : '•'
                            }
                          </span>
                        </button>
                        <button
                          onClick={() => handleCategorySelect(sub1.id, 'sub1')}
                          className={`flex-1 px-3 py-2 text-left text-sm transition-colors ${
                            selectedCategory === `sub1:${sub1.id}`
                              ? 'bg-blue-100 text-blue-800'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {sub1.name} ({sub1.resourceCount})
                        </button>
                      </div>

                      {/* Sous-catégories niveau 2 */}
                      {expandedSubCategories.has(sub1.id) && (
                        <div className="ml-8 border-l-2 border-slate-100">
                          {sub1.subCategories.map((sub2) => (
                            <button
                              key={sub2.id}
                              onClick={() => handleCategorySelect(sub2.id, 'sub2')}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                selectedCategory === `sub2:${sub2.id}`
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-slate-400 mr-2">•</span>
                              {sub2.name} ({sub2.resourceCount})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filtres par pièce */}
      <div>
        <h4 className="font-medium text-slate-900 mb-3">Par pièce</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'Toutes les pièces', icon: '🏠' },
            { key: 'salon', label: 'Salon', icon: '🛋️' },
            { key: 'cuisine', label: 'Cuisine', icon: '🍳' },
            { key: 'chambre', label: 'Chambre', icon: '🛏️' },
            { key: 'salle de bain', label: 'Salle de bain', icon: '🚿' },
            { key: 'bureau', label: 'Bureau', icon: '💻' },
            { key: 'entree', label: 'Entrée', icon: '🚪' },
            { key: 'exterieur', label: 'Extérieur', icon: '🌿' }
          ].map((room) => (
            <button
              key={room.key}
              onClick={() => setSelectedRoom(room.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedRoom === room.key
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="mr-1">{room.icon}</span>
              {room.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}