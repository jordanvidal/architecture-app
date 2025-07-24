interface LibraryFiltersProps {
  resources: any[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRoom: string
  setSelectedRoom: (room: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export default function LibraryFilters({
  resources,
  selectedCategory,
  setSelectedCategory,
  selectedRoom,
  setSelectedRoom,
  viewMode,
  setViewMode
}: LibraryFiltersProps) {
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
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'ALL', label: 'Tous', icon: '📚', count: resources.length },
            { name: 'FAVORITES', label: 'Favoris', icon: '⭐', count: resources.filter(r => r.isFavorite).length },
            { name: 'mobilier', label: 'Mobilier', icon: '🛋️', count: resources.filter(r => r.category?.name === 'mobilier').length },
            { name: 'eclairage', label: 'Éclairage', icon: '💡', count: resources.filter(r => r.category?.name === 'eclairage').length },
            { name: 'decoration', label: 'Décoration', icon: '🖼️', count: resources.filter(r => r.category?.name === 'decoration').length },
            { name: 'textile', label: 'Textile', icon: '🧶', count: resources.filter(r => r.category?.name === 'textile').length },
            { name: 'revetement', label: 'Revêtement', icon: '🧱', count: resources.filter(r => r.category?.name === 'revetement').length },
            { name: 'peinture', label: 'Peinture', icon: '🎨', count: resources.filter(r => r.category?.name === 'peinture').length }
          ].map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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